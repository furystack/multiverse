import { RequestAction, JsonResult } from '@furystack/rest'
import { LogLevel } from '@furystack/logging'
import { StoreManager } from '@furystack/core'
import { LogEntry } from 'common-models'
export const GetEntries: RequestAction<{
  query: {
    orderBy: keyof LogEntry<any>
    orderDirection: 'ASC' | 'DESC'
    levels: LogLevel[]
    scope?: string
    message?: string
    top?: number
    skip?: number
  }
  result: Array<LogEntry<any>>
}> = async ({ injector, getQuery }) => {
  const ds = injector.getInstance(StoreManager).getStoreFor(LogEntry)
  const query = await getQuery()
  const order: any = {}
  query.orderBy && (order[query.orderBy] = query.orderDirection || 'DESC')
  const levels = ((query.levels as any) as string)
    .split(',')
    .map(s => parseInt(s, 10))
    .filter(s => s)
  const entries = await ds.search({
    order,
    top: query.top || 100,
    skip: query.skip || 0,
    filter: {
      ...(query.message ? { message: { $regex: `(.)+${query.message}(.)+` } } : {}),
      ...(query.scope ? { scope: { $eq: query.scope } } : {}),
      ...(levels.length ? { level: { $in: levels } } : {}),
    },
  })
  return JsonResult(entries)
}
