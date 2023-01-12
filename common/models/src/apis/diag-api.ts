import type { RestApi, GetCollectionEndpoint, GetEntityEndpoint } from '@furystack/rest'
import type { LogEntry } from '../diag/log-entry'
import type { Patch } from '../diag'

export interface DiagApi extends RestApi {
  GET: {
    '/logEntries': GetCollectionEndpoint<LogEntry>
    '/logEntries/:id': GetEntityEndpoint<LogEntry, '_id'>
    '/patches': GetCollectionEndpoint<Patch>
    '/patches/:id': GetEntityEndpoint<Patch, '_id'>
  }
}
