import { Injectable } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { apis, serialize } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'

@Injectable({ lifetime: 'singleton' })
export class DiagApiService {
  public call = createClient<apis.DiagApi>({
    endpointUrl: PathHelper.joinPaths(window.location.origin, sites.services.diag.apiPath),
    serializeQueryParams: serialize,
    requestInit: {
      credentials: 'include',
    },
  })
}
