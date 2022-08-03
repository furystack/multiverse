import { Injector } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { apis } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'
import { EnvironmentService } from '../environment-service'

export const useDashboardApi = (injector: Injector) =>
  createClient<apis.DashboardApi>({
    endpointUrl: PathHelper.joinPaths(
      injector.getInstance(EnvironmentService).siteRoots.dashboard,
      sites.services.dashboard.apiPath,
    ),
    requestInit: {
      credentials: 'include',
    },
  })
