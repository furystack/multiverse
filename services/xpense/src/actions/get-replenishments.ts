import { RequestAction, JsonResult } from '@furystack/rest'
import { FindOptions, PartialResult } from '@furystack/core'
import { Replenishment } from '@common/models/src/xpense'

export const GetReplenishments: RequestAction<{
  query: { filter: FindOptions<Replenishment, any> }
  result: { count: number; entries: Array<PartialResult<Replenishment, any>> }
}> = async ({ injector, getQuery }) => {
  const ds = injector.getDataSetFor<Replenishment>('replenishments')
  const search = getQuery().filter
  const entries = await ds.find(injector, search)
  const count = await ds.count(injector, search.filter)
  return JsonResult({ entries, count })
}
