import { RestApi, RequestAction } from '@furystack/rest'
import { LogLevel } from '@furystack/logging'
import { LogEntry } from '../log-entry'

export interface LoggRApi extends RestApi {
  GET: {
    '/entries': RequestAction<{
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
    }>
  }
}
