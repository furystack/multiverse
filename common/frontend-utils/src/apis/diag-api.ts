import { Injectable } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { apis } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'
import { EnvironmentService } from '../environment-service'

@Injectable({ lifetime: 'singleton' })
export class DiagApiService {
  public call = createClient<apis.DiagApi>({
    endpointUrl: PathHelper.joinPaths(this.env.siteRoots.diag, sites.services.diag.apiPath),
    requestInit: {
      credentials: 'include',
    },
  })

  constructor(private readonly env: EnvironmentService) {}
}
