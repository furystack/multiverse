import { sites } from '@common/config'
import { apis, deserialize, diag } from '@common/models'
import { Authorize } from '@furystack/rest-service'
import { attachShutdownHandler, createCollectionEndpoint, createSingleEntityEndpoint } from '@common/service-utils'
import { injector } from './config'

injector.useRestService<apis.DiagApi>({
  port: parseInt(sites.services.diag.internalPort as string, 10),
  deserializeQueryParams: deserialize,

  root: '/api/diag',
  api: {
    GET: {
      '/logEntries': Authorize('sys-logs')(createCollectionEndpoint({ model: diag.LogEntry })),
      '/logEntry/:id': Authorize('sys-logs')(createSingleEntityEndpoint({ model: diag.LogEntry })),
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
  },
})

attachShutdownHandler(injector)
