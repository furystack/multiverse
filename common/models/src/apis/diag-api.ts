import { PartialResult, FindOptions } from '@furystack/core'
import { LogLevel } from '@furystack/logging'
import { RestApi, RequestAction } from '@furystack/rest'
import { LogEntry } from '../log-entry'

export interface DiagLogEntryQuerySettings {
  orderBy: keyof LogEntry<any>
  orderDirection: 'ASC' | 'DESC'
  levels: LogLevel[]
  scope?: string
  message?: string
  top?: number
  skip?: number
}

export interface DiagApi extends RestApi {
  GET: {
    '/logEntries': RequestAction<{
      query: { filter: FindOptions<LogEntry<any>, any> }
      result: { count: number; entries: Array<PartialResult<LogEntry<any>, any>> }
    }>
    '/logEntry/:_id': RequestAction<{
      urlParams: { _id: string }
      result: LogEntry<any>
    }>
  }
}
