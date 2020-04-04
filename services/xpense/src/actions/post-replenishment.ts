import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { xpense } from 'common-models'
import { HttpUserContext } from '@furystack/rest-service'

export const PostReplenishment: RequestAction<{
  body: { amount: number; comment?: string }
  query: { type: 'user' | 'organization'; owner: string; accountName: string }
  result: xpense.Replenishment
}> = async ({ injector, getBody, getQuery }) => {
  const currentUser = await injector.getInstance(HttpUserContext).getCurrentUser()
  const body = await getBody()
  const { accountName, owner, type } = getQuery()
  const ds = injector.getDataSetFor<xpense.Account>('accounts')
  const [account] = await ds.filter(injector, {
    filter: { name: accountName, ownerType: type, ownerName: owner },
    top: 1,
  })
  if (!account) {
    throw new RequestError('Account not found!', 404)
  }

  const createdReplenishment = await injector.getDataSetFor<xpense.Replenishment>('replenishments').add(injector, {
    ...body,
    createdBy: currentUser.username,
    accountId: account._id,
  } as xpense.Replenishment)

  await ds.update(injector, account._id, {
    ...account,
    history: [
      ...account.history,
      {
        balance: account.current + createdReplenishment.amount,
        change: createdReplenishment.amount,
        date: new Date().toISOString(),
        changePerCategory: [],
        relatedEntry: { replenishmentId: createdReplenishment._id },
      },
    ],
  })

  return JsonResult(createdReplenishment)
}
