import { RequestAction, JsonResult } from '@furystack/rest'
import { xpense } from '@common/models'

export const GetShops: RequestAction<{
  result: xpense.Shop[]
}> = async ({ injector }) => {
  const ds = injector.getDataSetFor<xpense.Shop>('shops')
  const entries = await ds.find(injector, {})
  return JsonResult(entries as xpense.Shop[])
}
