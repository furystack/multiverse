import { RequestAction, JsonResult } from '@furystack/rest'
import { FindOptions, PartialResult } from '@furystack/core'
import { Shopping } from '@common/models/src/xpense'

export const GetShoppings: RequestAction<{
  query: { filter: FindOptions<Shopping, any> }
  result: { count: number; entries: Array<PartialResult<Shopping, any>> }
}> = async ({ injector, getQuery }) => {
  const ds = injector.getDataSetFor<Shopping>('shoppings')
  const search = getQuery().filter
  const entries = await ds.find(injector, search)
  const count = await ds.count(injector, search.filter)
  return JsonResult({ entries, count })
}
