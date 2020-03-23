import { RequestAction, JsonResult } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { LogEntry, LoggREntryQuerySettings } from 'common-models'
export const GetEntries: RequestAction<{
  query: { filter: string }
  result: Array<LogEntry<any>>
}> = async ({ injector, getQuery }) => {
  const ds = injector.getInstance(StoreManager).getStoreFor(LogEntry)
  const query = JSON.parse(getQuery().filter) as LoggREntryQuerySettings
  const order: any = {}
  query.orderBy && (order[query.orderBy] = query.orderDirection || 'DESC')
  const entries = await ds.search({
    order,
    top: query.top || 100,
    skip: query.skip || 0,
    filter: {
      ...(query.message ? { message: { $regex: `(.)+${query.message}(.)+` } } : {}),
      ...(query.scope ? { scope: { $eq: query.scope } } : {}),
      ...(query.levels?.length ? { level: { $in: query.levels } } : {}),
    },
  })
  return JsonResult(entries)
}
