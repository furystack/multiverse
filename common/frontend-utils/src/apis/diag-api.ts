import { Injectable } from '@furystack/inject'
import { apis, serialize } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'

@Injectable({ lifetime: 'singleton' })
export class DiagApiService {
  public call = createClient<apis.DiagApi>({
    endpointUrl: sites.services.diag.apiPath,
    serializeQueryParams: serialize,
    requestInit: {
      credentials: 'include',
    },
  })
}
