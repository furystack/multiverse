import { sites } from '@common/config'
import { apis, deserialize, diag } from '@common/models'
import { Authorize } from '@furystack/rest-service'
import {
  attachShutdownHandler,
  createCollectionEndpoint,
  createSingleEntityEndpoint,
  runPatches,
} from '@common/service-utils'
import { injector } from './config'
import { createInitialIndexes } from './patches'

injector.useRestService<apis.DiagApi>({
  port: parseInt(sites.services.diag.internalPort as string, 10),
  deserializeQueryParams: deserialize,

  root: '/api/diag',
  api: {
    GET: {
      '/logEntries': Authorize('sys-diags')(createCollectionEndpoint({ model: diag.LogEntry })),
      '/logEntries/:id': Authorize('sys-diags')(createSingleEntityEndpoint({ model: diag.LogEntry })),
      '/patches': Authorize('sys-diags')(createCollectionEndpoint({ model: diag.Patch })),
      '/patches/:id': Authorize('sys-diags')(createSingleEntityEndpoint({ model: diag.Patch })),
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
  },
})

attachShutdownHandler(injector)

runPatches({ injector, appName: 'diag', patches: [createInitialIndexes] }).then(() => {
  injector.setupRepository((repo) => repo.createDataSet(diag.Patch, {}))
})
