import { RequestAction, JsonResult } from '@furystack/rest'
import { SearchOptions, PartialResult } from '@furystack/core'
import { LogEntry } from '@common/models'

export const GetEntries: RequestAction<{
  query: { filter: string }
  result: { count: number; entries: Array<PartialResult<LogEntry<any>, any>> }
}> = async ({ injector, getQuery }) => {
  const ds = injector.getDataSetFor<LogEntry<any>>('logEntries')
  const search = JSON.parse(getQuery().filter) as SearchOptions<LogEntry<any>, any>
  const entries = await ds.filter(injector, search)
  const count = await ds.count(injector, search.filter)
  return JsonResult({ entries, count })
}
