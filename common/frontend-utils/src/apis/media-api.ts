import { Injectable } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { apis, serialize } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'

@Injectable({ lifetime: 'singleton' })
export class MediaApiService {
  public call = createClient<apis.MediaApi>({
    endpointUrl: PathHelper.joinPaths(window.location.origin, sites.services.media.apiPath),
    serializeQueryParams: serialize,
    requestInit: {
      credentials: 'include',
    },
  })
}
