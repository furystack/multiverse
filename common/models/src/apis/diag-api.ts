import { RestApi } from '@furystack/rest'
import { LogEntry } from '../diag/log-entry'
import { CollectionEndpoint, SingleEntityEndpoint } from '../endpoints'
import { Patch } from '../diag'

export interface DiagApi extends RestApi {
  GET: {
    '/logEntries': CollectionEndpoint<LogEntry<any>>
    '/logEntries/:id': SingleEntityEndpoint<LogEntry<any>>
    '/patches': CollectionEndpoint<Patch>
    '/patches/:id': SingleEntityEndpoint<Patch>
  }
}
