import { sites } from '@common/config'
import { apis } from '@common/models'
import { Authorize } from '@furystack/rest-service'
import { attachShutdownHandler } from '@common/service-utils'
import { injector } from './config'
import { GetEntries, GetEntry } from './actions'

injector.useRestService<apis.DiagApi>({
  port: parseInt(sites.services.diag.internalPort as string, 10),
  root: '/diag',
  api: {
    GET: {
      '/logEntries': Authorize('sys-logs')(GetEntries),
      '/logEntry/:_id': Authorize('sys-logs')(GetEntry),
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
  },
})

attachShutdownHandler(injector)
