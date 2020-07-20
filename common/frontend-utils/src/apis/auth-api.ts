import { Injectable } from '@furystack/inject'
import { apis, serialize } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'

@Injectable({ lifetime: 'singleton' })
export class AuthApiService {
  public call = createClient<apis.AuthApi>({
    endpointUrl: sites.services.auth.apiPath,
    serializeQueryParams: serialize,
    requestInit: {
      credentials: 'include',
    },
  })
}
