import { Injectable } from '@furystack/inject'
import { apis, serialize } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'

@Injectable({ lifetime: 'singleton' })
export class XpenseApiService {
  public call = createClient<apis.XpenseApi>({
    endpointUrl: sites.services.xpense.apiPath,
    serializeQueryParams: serialize,
    requestInit: {
      credentials: 'include',
    },
  })
}
