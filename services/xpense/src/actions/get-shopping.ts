import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { xpense } from '@common/models'

export const GetShopping: RequestAction<{
  urlParams: { shoppingId: string }
  result: xpense.Shopping
}> = async ({ injector, getUrlParams }) => {
  const { shoppingId } = getUrlParams()
  const ds = injector.getDataSetFor<xpense.Shopping>('shoppings')
  const shopping = await ds.get(injector, shoppingId)
  if (!shopping) {
    throw new RequestError(`Shop with id '${shoppingId}' not found`, 404)
  }
  return JsonResult(shopping)
}
