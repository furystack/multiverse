import { Injectable } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { WrapRApi } from 'common-models'
import { createClient } from '@furystack/rest-client-fetch'
import { environmentOptions } from '..'

@Injectable({ lifetime: 'singleton' })
export class WrapRApiService {
  public call = createClient<WrapRApi>({
    endpointUrl: PathHelper.joinPaths(environmentOptions.serviceUrl, '/wrap-r'),
  })
}
