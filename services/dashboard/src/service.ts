import { sites } from '@common/config'
import { apis, deserialize, diag, dashboard } from '@common/models'
import {
  attachShutdownHandler,
  createCollectionEndpoint,
  runPatches,
  createSingleEntityEndpoint,
  createSinglePostEndpoint,
  createSinglePatchEndpoint,
} from '@common/service-utils'
import { injector } from './config'
import { createInitialIndexes } from './patches'

injector.useRestService<apis.DashboardApi>({
  port: parseInt(sites.services.dashboard.internalPort as string, 10),
  deserializeQueryParams: deserialize,

  root: '/api/dashboard',
  api: {
    GET: {
      '/boards': createCollectionEndpoint({ model: dashboard.Dashboard }),
      '/boards/:id': createSingleEntityEndpoint({ model: dashboard.Dashboard }),
    },
    POST: {
      '/boards': createSinglePostEndpoint(dashboard.Dashboard),
    },
    PATCH: {
      '/boards/:id': createSinglePatchEndpoint(dashboard.Dashboard),
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
    methods: ['GET', 'POST', 'PATCH'],
  },
})

attachShutdownHandler(injector)

runPatches({ injector, appName: 'diag', patches: [createInitialIndexes] }).then(() => {
  injector.setupRepository((repo) => repo.createDataSet(diag.Patch, {}))
})
