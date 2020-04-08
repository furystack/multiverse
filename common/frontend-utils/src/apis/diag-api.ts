import { Injectable } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { apis } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'

@Injectable({ lifetime: 'singleton' })
export class DiagApiService {
  public call = createClient<apis.DiagApi>({
    endpointUrl: PathHelper.joinPaths(sites.services.diag.externalPath, '/diag'),
    requestInit: {
      credentials: 'include',
    },
  })
}
