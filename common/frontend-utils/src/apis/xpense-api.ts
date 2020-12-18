import { Injectable } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { apis, serialize } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'
import { EnvironmentService } from '../environment-service'

@Injectable({ lifetime: 'singleton' })
export class XpenseApiService {
  public call = createClient<apis.XpenseApi>({
    endpointUrl: PathHelper.joinPaths(this.env.siteRoots.xpense, sites.services.xpense.apiPath),
    serializeQueryParams: serialize,
    requestInit: {
      credentials: 'include',
    },
  })

  constructor(private readonly env: EnvironmentService) {}
}
