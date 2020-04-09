import { Injectable } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { apis, serialize } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'

@Injectable({ lifetime: 'singleton' })
export class XpenseApiService {
  public call = createClient<apis.XpenseApi>({
    endpointUrl: PathHelper.joinPaths(sites.services.xpense.externalPath, '/xpense'),
    serializeQueryParams: serialize,
    requestInit: {
      credentials: 'include',
    },
  })
}
