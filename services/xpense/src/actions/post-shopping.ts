import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { xpense } from '@common/models'
import { ensureItemsForShopping } from '../services/ensure-items-for-shopping'
import { recalculateHistory } from '../services/recalculate-history'

export const PostShopping: RequestAction<{
  body: {
    shopName: string
    creationDate: string
    entries: Array<{ itemName: string; amount: number; unitPrice: number }>
  }
  urlParams: { type: 'user' | 'organization'; owner: string; accountName: string }
  result: xpense.Shopping
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

  const { created } = await injector.getDataSetFor<xpense.Shopping>('shoppings').add(injector, {
    createdBy: currentUser.username,
    entries: body.entries,
    creationDate: new Date(body.creationDate).toISOString(),
    accountId: account._id,
    sumAmount: body.entries.reduce((last, current) => last + current.unitPrice * current.amount, 0),
    shopName: body.shopName,
  })

  const createdShopping = created[0]

  ensureItemsForShopping({ injector, shopping: createdShopping })
  await recalculateHistory({ injector, account })
  return JsonResult(createdShopping)
}
