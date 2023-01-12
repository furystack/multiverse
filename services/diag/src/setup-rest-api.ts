import type { Injector } from '@furystack/inject'
import type { apis } from '@common/models'
import { diag } from '@common/models'
import { sites } from '@common/config'
import {
  Authorize,
  createGetCollectionEndpoint,
  createGetEntityEndpoint,
  useRestService,
} from '@furystack/rest-service'
import { useCommonHttpAuth } from '@common/service-utils'

export const setupRestApi = (injector: Injector) => {
  useCommonHttpAuth(injector)
  useRestService<apis.DiagApi>({
    injector,
    port: parseInt(sites.services.diag.internalPort as string, 10),
    root: '/api/diag',
    api: {
      GET: {
        '/logEntries': Authorize('sys-diags')(createGetCollectionEndpoint({ model: diag.LogEntry, primaryKey: '_id' })),
        '/logEntries/:id': Authorize('sys-diags')(createGetEntityEndpoint({ model: diag.LogEntry, primaryKey: '_id' })),
        '/patches': Authorize('sys-diags')(createGetCollectionEndpoint({ model: diag.Patch, primaryKey: '_id' })),
        '/patches/:id': Authorize('sys-diags')(createGetEntityEndpoint({ model: diag.Patch, primaryKey: '_id' })),
      },
    },
    cors: {
      credentials: true,
      origins: Object.values(sites.frontends),
    },
  })
}
