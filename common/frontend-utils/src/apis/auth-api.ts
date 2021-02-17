import { Injectable } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { apis } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'
import { EnvironmentService } from '../environment-service'

@Injectable({ lifetime: 'singleton' })
export class AuthApiService {
  public call = createClient<apis.AuthApi>({
    endpointUrl: PathHelper.joinPaths(this.env.siteRoots.auth, sites.services.auth.apiPath),
    requestInit: {
      credentials: 'include',
    },
  })

  constructor(private readonly env: EnvironmentService) {}
}
