import { Injectable } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { apis } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from '@common/config'
import { EnvironmentService } from '../environment-service'

@Injectable({ lifetime: 'singleton' })
export class MediaApiService {
  public call = createClient<apis.MediaApi>({
    endpointUrl: PathHelper.joinPaths(this.env.siteRoots.media, sites.services.media.apiPath),
    requestInit: {
      credentials: 'include',
    },
  })

  constructor(private readonly env: EnvironmentService) {}
}
