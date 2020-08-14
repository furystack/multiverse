import { RestApi, GetCollectionEndpoint, GetEntityEndpoint } from '@furystack/rest'
import { LogEntry } from '../diag/log-entry'
import { Patch } from '../diag'

export interface DiagApi extends RestApi {
  GET: {
    '/logEntries': GetCollectionEndpoint<LogEntry<any>>
    '/logEntries/:id': GetEntityEndpoint<LogEntry<any>>
    '/patches': GetCollectionEndpoint<Patch>
    '/patches/:id': GetEntityEndpoint<Patch>
  }
}
