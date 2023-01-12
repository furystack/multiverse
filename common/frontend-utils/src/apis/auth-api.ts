import type { Injector } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import type { apis } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'
import { EnvironmentService } from '../environment-service'

export const useAuthApi = (injector: Injector) =>
  createClient<apis.AuthApi>({
    endpointUrl: PathHelper.joinPaths(
      injector.getInstance(EnvironmentService).siteRoots.auth,
      sites.services.auth.apiPath,
    ),
    requestInit: {
      credentials: 'include',
    },
  })
