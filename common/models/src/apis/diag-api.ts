import { RestApi, GetCollectionEndpoint, GetEntityEndpoint } from '@furystack/rest'
import { LogEntry } from '../diag/log-entry'
import { Patch } from '../diag'

export interface DiagApi extends RestApi {
  GET: {
    '/logEntries': GetCollectionEndpoint<LogEntry>
    '/logEntries/:id': GetEntityEndpoint<LogEntry>
    '/patches': GetCollectionEndpoint<Patch>
    '/patches/:id': GetEntityEndpoint<Patch>
  }
}
