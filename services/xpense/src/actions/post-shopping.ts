import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { xpense } from '@common/models'
import { HttpUserContext } from '@furystack/rest-service'
import { ensureItemsForShopping } from '../services/ensure-items-for-shopping'

export const PostShopping: RequestAction<{
  body: { shopName: string; entries: Array<{ itemName: string; amount: number; unitPrice: number }> }
  urlParams: { type: 'user' | 'organization'; owner: string; accountName: string }
  result: xpense.Shopping
}> = async ({ injector, getBody, getUrlParams }) => {
  const currentUser = await injector.getInstance(HttpUserContext).getCurrentUser()
  const body = await getBody()
  const { accountName, owner, type } = getUrlParams()
  const ds = injector.getDataSetFor<xpense.Account>('accounts')
  const [account] = await ds.filter(injector, {
    filter: { name: accountName, ownerType: type, ownerName: owner },
    top: 1,
  })
  if (!account) {
    throw new RequestError('Account not found!', 404)
  }

  const createdShopping = await injector.getDataSetFor<xpense.Shopping>('shoppings').add(injector, {
    createdBy: currentUser.username,
    entries: body.entries,
    creationDate: new Date().toISOString(),
    accountId: account._id,
    sumAmount: body.entries.reduce((last, current) => last + current.unitPrice * current.amount, 0),
    shopName: body.shopName,
  } as xpense.Shopping)

  ensureItemsForShopping({ injector, shopping: createdShopping })

  await ds.update(injector, account._id, {
    ...account,
    current: account.current - createdShopping.sumAmount,
    history: [
      ...account.history,
      {
        balance: account.current - createdShopping.sumAmount,
        change: -createdShopping.sumAmount,
        date: new Date().toISOString(),
        changePerCategory: [],
        relatedEntry: { type: 'shopping', shoppingId: createdShopping._id },
      },
    ],
  })

  return JsonResult(createdShopping)
}
