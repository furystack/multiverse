import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { xpense } from '@common/models'

export const GetShop: RequestAction<{
  urlParams: { shopId: string }
  result: xpense.Shop
}> = async ({ injector, getUrlParams }) => {
  const { shopId } = getUrlParams()
  const ds = injector.getDataSetFor<xpense.Shop>('shops')
  const shop = await ds.get(injector, shopId)
  if (!shop) {
    throw new RequestError(`Shop with id '${shopId}' not found`, 404)
  }
  return JsonResult(shop)
}
