import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { xpense } from '@common/models'
import { ObjectId } from 'mongodb'
import { recalculateHistory } from '../services/recalculate-history'

export const PostReplenishment: RequestAction<{
  body: { amount: number; comment?: string; creationDate: string }
  urlParams: { type: 'user' | 'organization'; owner: string; accountName: string }
  result: xpense.Replenishment
}> = async ({ injector, getBody, getUrlParams }) => {
  const currentUser = await injector.getCurrentUser()
  const body = await getBody()
  const { accountName, owner, type } = getUrlParams()
  const ds = injector.getDataSetFor<xpense.Account>('accounts')
  const [account] = await ds.find(injector, {
    filter: { name: { $eq: accountName }, ownerType: { $eq: type }, ownerName: { $eq: owner } },
    top: 1,
  })
  if (!account) {
    throw new RequestError('Account not found!', 404)
  }

  const createdReplenishment = {
    ...body,
    _id: new ObjectId().toHexString(),
    creationDate: new Date(body.creationDate).toISOString(),
    createdBy: currentUser.username,
    accountId: account._id,
  } as xpense.Replenishment
  await injector.getDataSetFor<xpense.Replenishment>('replenishments').add(injector, createdReplenishment)

  await recalculateHistory({ injector, account })

  return JsonResult(createdReplenishment)
}
