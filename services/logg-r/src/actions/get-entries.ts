import { RequestAction, JsonResult } from '@furystack/rest'
import { SearchOptions, PartialResult } from '@furystack/core'
import { LogEntry } from 'common-models'

export const GetEntries: RequestAction<{
  query: { filter: string }
  result: Array<PartialResult<LogEntry<any>, any>>
}> = async ({ injector, getQuery }) => {
  const ds = injector.getDataSetFor(LogEntry)
  const search = JSON.parse(getQuery().filter) as SearchOptions<LogEntry<any>, any>
  const entries = await ds.filter(injector, search)
  return JsonResult(entries)
}
