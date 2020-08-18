import { Injector } from '@furystack/inject'
import { apis, deserialize, diag } from '@common/models'
import { sites } from '@common/config'
import { Authorize, createGetCollectionEndpoint, createGetEntityEndpoint } from '@furystack/rest-service'

export const setupRestApi = (injector: Injector) => {
  injector.useCommonHttpAuth().useRestService<apis.DiagApi>({
    port: parseInt(sites.services.diag.internalPort as string, 10),
    deserializeQueryParams: deserialize,

    root: '/api/diag',
    api: {
      GET: {
        '/logEntries': Authorize('sys-diags')(createGetCollectionEndpoint({ model: diag.LogEntry })),
        '/logEntries/:id': Authorize('sys-diags')(createGetEntityEndpoint({ model: diag.LogEntry })),
        '/patches': Authorize('sys-diags')(createGetCollectionEndpoint({ model: diag.Patch })),
        '/patches/:id': Authorize('sys-diags')(createGetEntityEndpoint({ model: diag.Patch })),
      },
    },
    cors: {
      credentials: true,
      origins: Object.values(sites.frontends),
    },
  })
}
