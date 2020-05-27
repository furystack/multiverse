import { Constructable } from '@furystack/inject'
import { JsonResult, RequestError } from '@furystack/rest'
import { SinglePostEndpoint } from '@common/models'

export const createSinglePostEndpoint = <T extends object>(model: Constructable<T>) => {
  const endpoint: SinglePostEndpoint<T> = async ({ injector, request }) => {
    const entityToCreate = await request.readPostBody<T>()
    const dataSet = injector.getDataSetFor(model)
    const { created } = await dataSet.add(injector, entityToCreate)
    if (!created || !created.length) {
      throw new RequestError('Entity not found', 404)
    }
    return JsonResult(created[0])
  }
  return endpoint
}
