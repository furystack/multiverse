import { Injector } from '@furystack/inject'
import { apis, diag } from '@common/models'
import { sites } from '@common/config'
import { Authorize, createGetCollectionEndpoint, createGetEntityEndpoint } from '@furystack/rest-service'

export const setupRestApi = (injector: Injector) => {
  injector.useCommonHttpAuth().useRestService<apis.DiagApi>({
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
