import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { xpense } from 'common-models'
import { HttpUserContext } from '@furystack/rest-service'

export const PostShopping: RequestAction<{
  body: Array<{ itemName: string; amount: number; unitPrice: number }>
  query: { type: 'user' | 'organization'; owner: string; accountName: string }
  result: xpense.Shopping
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

  const createdShopping = await injector.getDataSetFor<xpense.Shopping>('shoppings').add(injector, {
    createdBy: currentUser.username,
    entries: body,
    creationDate: new Date().toISOString(),
    accountId: account._id,
    sumAmount: body.reduce<number>((last, current) => last + current.amount, 0),
    _id: '',
  })

  await ds.update(injector, account._id, {
    ...account,
    history: [
      ...account.history,
      {
        balance: account.current - createdShopping.sumAmount,
        change: -createdShopping.sumAmount,
        date: new Date().toISOString(),
        changePerCategory: [],
        relatedEntry: { shoppingId: createdShopping._id },
      },
    ],
  })

  return JsonResult(createdShopping)
}
