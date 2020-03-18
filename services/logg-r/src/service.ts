import { sites } from 'common-config'
import { LoggRApi } from 'common-models'
import { Authorize } from '@furystack/rest-service'
import { injector } from './config'
import { GetEntries } from './actions/get-entries'

const serviceUrl = new URL(sites.services['logg-r'])

injector.useRestService<LoggRApi>({
  port: parseInt(serviceUrl.port, 10),
  hostName: serviceUrl.hostname,
  root: '/logg-r',
  api: {
    GET: {
      '/entries': Authorize('sys-logs')(GetEntries),
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
  },
})
injector.disposeOnProcessExit()
