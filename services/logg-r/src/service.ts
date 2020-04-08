import { sites } from '@common/config'
import { apis } from '@common/models'
import { Authorize } from '@furystack/rest-service'
import { attachShutdownHandler } from '@common/service-utils'
import { injector } from './config'
import { GetEntries, GetEntry } from './actions'

injector.useRestService<apis.LoggRApi>({
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

attachShutdownHandler(injector)
