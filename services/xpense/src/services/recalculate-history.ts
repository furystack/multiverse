import { Injector } from '@furystack/inject'
import { xpense } from '@common/models'

export const recalculateHistory = async ({
  accountId,
  injector,
}: {
  accountId: string
  injector: Injector
}): Promise<xpense.Account> => {
  const currentAccount = await injector.getDataSetFor(xpense.Account, '_id').get(injector, accountId)

  if (!currentAccount) {
    throw new Error('Account not found')
  }

  const replenishPromise = injector
    .getDataSetFor(xpense.Replenishment, '_id')
    .find(injector, { filter: { accountId: { $eq: accountId } }, select: ['_id', 'amount', 'creationDate'] })
  const shoppingPromise = injector
    .getDataSetFor(xpense.Shopping, '_id')
    .find(injector, { filter: { accountId: { $eq: accountId } }, select: ['_id', 'sumAmount', 'creationDate'] })

  const [replenishments, shoppings] = await Promise.all([replenishPromise, shoppingPromise])

  const history = [
    ...replenishments.map(
      (r) =>
        ({
          change: r.amount,
          date: r.creationDate,
          relatedEntry: { type: 'replenishment', replenishmentId: r._id },
          balance: 0,
        } as xpense.AccountHistoryEntry),
    ),
    ...shoppings.map(
      (s) =>
        ({
          change: -s.sumAmount,
          date: s.creationDate,
          relatedEntry: { type: 'shopping', shoppingId: s._id },
          balance: 0,
        } as xpense.AccountHistoryEntry),
    ),
  ]
    .sort((n1, n2) => {
      return new Date(n1.date).getTime() - new Date(n2.date).getTime()
    })
    .reduce<xpense.AccountHistoryEntry[]>(
      (last, current) => [...last, { ...current, balance: (last[last.length - 1]?.balance || 0) + current.change }],
      [],
    )

  const current = history[history.length - 1].balance

  await injector.getDataSetFor(xpense.Account, '_id').update(injector, accountId, { history, current })

  return { ...currentAccount, history, current }
}
