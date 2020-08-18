import { Injector } from '@furystack/inject'
import {
  createGetCollectionEndpoint,
  createGetEntityEndpoint,
  createPostEndpoint,
  createPatchEndpoint,
} from '@furystack/rest-service'
import { apis, deserialize, dashboard } from '@common/models'
import { sites } from '@common/config'

export const setupRestApi = (injector: Injector) => {
  injector.useCommonHttpAuth().useRestService<apis.DashboardApi>({
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
}
