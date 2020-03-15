import { RestApi, RequestAction } from '@furystack/rest'
import { LogEntry } from '../log-entry'

export interface LoggRApi extends RestApi {
  GET: {
    '/entries': RequestAction<{
      query: {
        top: number
        skip: number
        orderBy: keyof LogEntry<any>
        orderDirection: 'asd' | 'desc'
        scope: string
        message: string
      }
    }>
  }
}
