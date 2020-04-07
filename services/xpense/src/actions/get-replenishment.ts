import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { xpense } from 'common-models'

export const GetReplenishment: RequestAction<{
  urlParams: { replenishmentId: string }
  result: xpense.Replenishment
}> = async ({ injector, getUrlParams }) => {
  const { replenishmentId } = getUrlParams()
  const ds = injector.getDataSetFor<xpense.Replenishment>('replenishments')
  const replenishment = await ds.get(injector, replenishmentId)
  if (!replenishment) {
    throw new RequestError(`Replenishment with id '${replenishmentId}' not found`, 404)
  }
  return JsonResult(replenishment)
}
