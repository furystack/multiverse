import { LogLevel } from '@furystack/logging'
import { RestApi } from '@furystack/rest'
import { LogEntry } from '../log-entry'
import { CollectionEndpoint, SingleEntityEndpoint } from '../endpoints'

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
    '/logEntries': CollectionEndpoint<LogEntry<any>>
    '/logEntry/:id': SingleEntityEndpoint<LogEntry<any>>
  }
}
