import { Constructable } from '@furystack/inject'
import { JsonResult, RequestError } from '@furystack/rest'
import { SingleEntityEndpoint } from '@common/models'

export const createSingleEntityEndpoint = <T>(options: { model: Constructable<T> }) => {
  const endpoint: SingleEntityEndpoint<T> = async ({ injector, getUrlParams, getQuery }) => {
    const { id } = getUrlParams()
    const { select } = getQuery()
    const dataSet = injector.getDataSetFor(options.model)
    const entry = await dataSet.get(injector, id, select)
    if (!entry) {
      throw new RequestError('Entity not found', 404)
    }
    return JsonResult(entry)
  }
  return endpoint
}
