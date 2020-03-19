import { Injectable } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { LoggRApi } from 'common-models'
import { createClient } from '@furystack/rest-client-fetch'
import { sites } from 'common-config'

@Injectable({ lifetime: 'singleton' })
export class LoggRApiService {
  public call = createClient<LoggRApi>({
    endpointUrl: PathHelper.joinPaths(sites.services['logg-r'].externalPath, '/logg-r'),
    requestInit: {
      credentials: 'include',
    },
  })
}
