import { sites } from 'common-config'
import { LoggRApi } from 'common-models'
import { Authorize } from '@furystack/rest-service'
import { injector } from './config'
import { GetEntries, GetEntry } from './actions'

injector.useRestService<LoggRApi>({
  port: parseInt(sites.services['logg-r'].internalPort as string, 10),
  root: '/api/logg-r',
  api: {
    GET: {
      '/entries': Authorize('sys-logs')(GetEntries),
      '/entry/:_id': Authorize('sys-logs')(GetEntry),
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
  },
})
injector.disposeOnProcessExit()
