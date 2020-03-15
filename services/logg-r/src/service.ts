import { Authorize } from '@furystack/rest-service'
import { sites } from 'common-config'
import { LoggRApi, SessionApi } from 'common-models'
import { SetSessionAction } from 'common-service-utils'
import { RequestError } from '@furystack/rest'
import { injector } from './config'

const serviceUrl = new URL(sites.services['logg-r'])

injector.useRestService<SessionApi>({
  port: parseInt(serviceUrl.port, 10),
  hostName: serviceUrl.hostname,
  root: '/logg-r-session',
  api: {
    GET: {
      '/setSession': SetSessionAction,
    },
  },
})

injector.useRestService<LoggRApi>({
  port: parseInt(serviceUrl.port, 10),
  hostName: serviceUrl.hostname,
  root: '/logg-r',
  api: {
    GET: {
      '/entries': Authorize('sys-logs')(async () => {
        throw new RequestError('Not implemented yet :((', 400)
      }),
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
  },
})
injector.disposeOnProcessExit()
