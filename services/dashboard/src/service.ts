import { sites } from '@common/config'
import { apis, deserialize, diag, dashboard } from '@common/models'
import { attachShutdownHandler, runPatches } from '@common/service-utils'
import {
  createGetCollectionEndpoint,
  createGetEntityEndpoint,
  createPostEndpoint,
  createPatchEndpoint,
} from '@furystack/rest-service'
import { injector } from './config'
import { createInitialIndexes } from './patches'

injector.useRestService<apis.DashboardApi>({
  port: parseInt(sites.services.dashboard.internalPort as string, 10),
  deserializeQueryParams: deserialize,

  root: '/api/dashboard',
  api: {
    GET: {
      '/boards': createGetCollectionEndpoint({ model: dashboard.Dashboard }),
      '/boards/:id': createGetEntityEndpoint({ model: dashboard.Dashboard }),
    },
    POST: {
      '/boards': createPostEndpoint({ model: dashboard.Dashboard }),
    },
    PATCH: {
      '/boards/:id': createPatchEndpoint({ model: dashboard.Dashboard }),
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
