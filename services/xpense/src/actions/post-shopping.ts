import { RequestError } from '@furystack/rest'
import { xpense } from '@common/models'
import { RequestAction, JsonResult } from '@furystack/rest-service'
import { ensureItemsForShopping } from '../services/ensure-items-for-shopping'
import { recalculateHistory } from '../services/recalculate-history'

export const PostShopping: RequestAction<{
  body: {
    shopName: string
    creationDate: string
    entries: Array<{ itemName: string; amount: number; unitPrice: number }>
  }
  url: { accountId: string }
  result: xpense.Shopping
}> = async ({ injector, getBody, getUrlParams }) => {
  const currentUser = await injector.getCurrentUser()
  const body = await getBody()
  const { accountId } = getUrlParams()
  const ds = injector.getDataSetFor(xpense.Account)
  const account = await ds.get(injector, accountId)
  if (!account) {
    throw new RequestError('Account not found!', 404)
  }

  const { created } = await injector.getDataSetFor(xpense.Shopping).add(injector, {
    createdBy: currentUser.username,
    entries: body.entries,
    creationDate: new Date(body.creationDate).toISOString(),
    accountId,
    sumAmount: body.entries.reduce((last, current) => last + current.unitPrice * current.amount, 0),
    shopName: body.shopName,
  })

  const createdShopping = created[0]

  ensureItemsForShopping({ injector, shopping: createdShopping })
  await recalculateHistory({ injector, accountId })
  return JsonResult(createdShopping)
}
