import { Injectable } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { apis, serialize } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'

@Injectable({ lifetime: 'singleton' })
export class AuthApiService {
  public call = createClient<apis.AuthApi>({
    endpointUrl: PathHelper.joinPaths(sites.services.auth.externalPath, '/auth'),
    serializeQueryParams: serialize,
    requestInit: {
      credentials: 'include',
    },
  })
}
