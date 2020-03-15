import { Injectable } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { WrapRApi } from 'common-models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from 'common-config'

@Injectable({ lifetime: 'singleton' })
export class WrapRApiService {
  public call = createClient<WrapRApi>({
    endpointUrl: PathHelper.joinPaths(sites.services['wrap-r'], '/wrap-r'),
  })
}
