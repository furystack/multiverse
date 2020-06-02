import { RestApi } from '@furystack/rest'
import { LogEntry } from '../diag/log-entry'
import { CollectionEndpoint, SingleEntityEndpoint } from '../endpoints'

export interface DiagApi extends RestApi {
  GET: {
    '/logEntries': CollectionEndpoint<LogEntry<any>>
    '/logEntry/:id': SingleEntityEndpoint<LogEntry<any>>
  }
}
