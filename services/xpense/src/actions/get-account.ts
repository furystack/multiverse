import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { xpense } from 'common-models'

export const GetAccount: RequestAction<{
  result: xpense.Account
  urlParams: { type: 'user' | 'organization'; owner: string; accountName: string }
}> = async ({ injector, getUrlParams }) => {
  const { accountName, owner, type } = getUrlParams()
  const ds = injector.getDataSetFor<xpense.Account>('accounts')
  const [account] = await ds.filter(injector, {
    filter: { $and: [{ name: accountName }, { ownerType: type }, { ownerName: owner }] },
    top: 1,
  })
  if (!account) {
    throw new RequestError('Account not found!', 404)
  }
  return JsonResult(account)
}
