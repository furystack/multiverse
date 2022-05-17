import { Injector } from '@furystack/inject'
import {
  createGetCollectionEndpoint,
  createGetEntityEndpoint,
  createPostEndpoint,
  createPatchEndpoint,
  Authenticate,
  useRestService,
} from '@furystack/rest-service'
import { apis, dashboard } from '@common/models'
import { sites } from '@common/config'
import { useCommonHttpAuth } from '@common/service-utils'
import { GetWeatherForecastAction } from './actions/get-weather-forecast-action'

export const setupRestApi = (injector: Injector) => {
  useCommonHttpAuth(injector)
  useRestService<apis.DashboardApi>({
    injector,
    port: parseInt(sites.services.dashboard.internalPort as string, 10),
    root: '/api/dashboard',
    api: {
      GET: {
        '/boards': createGetCollectionEndpoint({ model: dashboard.Dashboard, primaryKey: '_id' }),
        '/boards/:id': createGetEntityEndpoint({ model: dashboard.Dashboard, primaryKey: '_id' }),
        '/weather-forecast': Authenticate()(GetWeatherForecastAction),
      },
      POST: {
        '/boards': createPostEndpoint({ model: dashboard.Dashboard, primaryKey: '_id' }),
      },
      PATCH: {
        '/boards/:id': createPatchEndpoint({ model: dashboard.Dashboard, primaryKey: '_id' }),
      },
    },
    cors: {
      credentials: true,
      origins: Object.values(sites.frontends),
      methods: ['GET', 'POST', 'PATCH'],
    },
  })
}
