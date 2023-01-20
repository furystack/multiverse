import type { Injector } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import type { apis } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'
import { EnvironmentService } from '../environment-service'

export const useDiagApi = (injector: Injector) =>
  createClient<apis.DiagApi>({
    endpointUrl: PathHelper.joinPaths(
      injector.getInstance(EnvironmentService).siteRoots.diag,
      sites.services.diag.apiPath,
    ),
    requestInit: {
      credentials: 'include',
    },
  })
