import { Injector } from '@furystack/inject'
import { xpense } from '@common/models'

export const recalculateHistory = async ({
  account,
  injector,
}: {
  account: xpense.Account
  injector: Injector
}): Promise<xpense.Account> => {
  const currentAccount = await injector.getDataSetFor(xpense.Account).get(injector, account._id)

  if (!currentAccount) {
    throw new Error('Account not found')
  }

  const replenishPromise = injector
    .getDataSetFor(xpense.Replenishment)
    .find(injector, { filter: { accountId: { $eq: account._id } }, select: ['_id', 'amount', 'creationDate'] })
  const shoppingPromise = injector
    .getDataSetFor(xpense.Shopping)
    .find(injector, { filter: { accountId: { $eq: account._id } }, select: ['_id', 'sumAmount', 'creationDate'] })

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

  const updated: xpense.Account = {
    ...currentAccount,
    history,
    current: history[history.length - 1].balance,
  }

  await injector.getDataSetFor(xpense.Account).update(injector, account._id, updated)

  return updated
}
