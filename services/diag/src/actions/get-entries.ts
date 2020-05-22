import { RequestAction, JsonResult } from '@furystack/rest'
import { FindOptions, PartialResult } from '@furystack/core'
import { LogEntry } from '@common/models'

export const GetEntries: RequestAction<{
  query: { filter: FindOptions<LogEntry<any>, any> }
  result: { count: number; entries: Array<PartialResult<LogEntry<any>, any>> }
}> = async ({ injector, getQuery }) => {
  const ds = injector.getDataSetFor<LogEntry<any>>('logEntries')
  const search = getQuery().filter
  const entries = await ds.find(injector, search)
  const count = await ds.count(injector, search.filter)
  return JsonResult({ entries, count })
}
