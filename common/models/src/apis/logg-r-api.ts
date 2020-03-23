import { LogLevel } from '@furystack/logging'
import { RestApi, RequestAction } from '@furystack/rest'
import { LogEntry } from '../log-entry'

export interface LoggREntryQuerySettings {
  orderBy: keyof LogEntry<any>
  orderDirection: 'ASC' | 'DESC'
  levels: LogLevel[]
  scope?: string
  message?: string
  top?: number
  skip?: number
}

export interface LoggRApi extends RestApi {
  GET: {
    '/entries': RequestAction<{
      query: { filter: string }
      result: Array<LogEntry<any>>
    }>
  }
}
