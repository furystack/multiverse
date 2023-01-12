import type { Injector } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import type { apis } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'
import { EnvironmentService } from '../environment-service'

export const useMediaApi = (injector: Injector) =>
  createClient<apis.MediaApi>({
    endpointUrl: PathHelper.joinPaths(
      injector.getInstance(EnvironmentService).siteRoots.media,
      sites.services.media.apiPath,
    ),
    requestInit: {
      credentials: 'include',
    },
  })
