import { Constructable } from '@furystack/inject'
import { JsonResult } from '@furystack/rest'
import { CollectionEndpoint } from '@common/models'

export const createCollectionEndpoint = <T>(options: { model: Constructable<T> }) => {
  const endpoint: CollectionEndpoint<T> = async ({ injector, getQuery }) => {
    const { findOptions } = getQuery()
    const dataSet = injector.getDataSetFor(options.model)
    const entriesPromise = dataSet.find<any>(injector, findOptions)
    const countPromise = dataSet.count(injector, findOptions.filter)
    const [entries, count] = await Promise.all([entriesPromise, countPromise])

    return JsonResult({ entries, count })
  }
  return endpoint
}
