import { Injectable } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { apis, serialize } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'
import { EnvironmentService } from '../environment-service'

@Injectable({ lifetime: 'singleton' })
export class DashboardApiService {
  public call = createClient<apis.DashboardApi>({
    endpointUrl: PathHelper.joinPaths(this.env.siteRoots.dashboard, sites.services.dashboard.apiPath),
    serializeQueryParams: serialize,
    requestInit: {
      credentials: 'include',
    },
  })
  constructor(private readonly env: EnvironmentService) {}
}
