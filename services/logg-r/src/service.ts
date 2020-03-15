import { sites } from 'common-config'
import { LoggRApi, SessionApi, LogEntry } from 'common-models'
import { SetSessionAction } from 'common-service-utils'
import { JsonResult } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { HttpUserContext } from '@furystack/rest-service'
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
      '/entries': async ({ injector: i, getQuery }) => {
        const ds = i.getInstance(StoreManager).getStoreFor(LogEntry)
        const query = await getQuery()
        const order: any = {}
        query.orderBy && (order[query.orderBy] = query.orderDirection || 'DESC')
        const entries = await ds.search({
          order,
          top: query.top || 100,
          skip: query.skip || 0,
          filter: {
            ...(query.message ? { message: { $regex: `(.)+${query.message}(.)+` } } : {}),
            ...(query.scope ? { scope: { $eq: query.scope } } : {}),
            ...(query.levels ? { level: { $in: query.levels } } : {}),
          },
        })
        return JsonResult(entries)
      },
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
  },
})
injector.disposeOnProcessExit()
