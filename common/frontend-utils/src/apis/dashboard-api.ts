import { Injectable } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { apis, serialize } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'

@Injectable({ lifetime: 'singleton' })
export class DashboardApiService {
  public call = createClient<apis.DashboardApi>({
    endpointUrl: PathHelper.joinPaths(sites.services.dashboard.externalPath, '/dashboard'),
    serializeQueryParams: serialize,
    requestInit: {
      credentials: 'include',
    },
  })
}