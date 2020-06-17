import { Constructable } from '@furystack/inject'
import { JsonResult } from '@furystack/rest'
import { SinglePatchEndpoint } from '@common/models'

export const createSinglePatchEndpoint = <T extends object>(model: Constructable<T>) => {
  const endpoint: SinglePatchEndpoint<T> = async ({ injector, request, getUrlParams }) => {
    const { id } = getUrlParams()
    const patchData = await request.readPostBody<T>()
    const dataSet = injector.getDataSetFor(model)
    await dataSet.update(injector, id, patchData)
    return JsonResult({ success: true })
  }
  return endpoint
}
