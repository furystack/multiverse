import { RequestAction, JsonResult } from '@furystack/rest'
import { StoreManager, SearchOptions, PartialResult } from '@furystack/core'
import { LogEntry } from 'common-models'

export const GetEntries: RequestAction<{
  query: { filter: string }
  result: Array<PartialResult<LogEntry<any>, any>>
}> = async ({ injector, getQuery }) => {
  const ds = injector.getInstance(StoreManager).getStoreFor(LogEntry)
  const search = JSON.parse(getQuery().filter) as SearchOptions<LogEntry<any>, any>
  const entries = await ds.search(search)
  return JsonResult(entries)
}
