import { sites } from '@common/config'
import { apis, deserialize, xpense } from '@common/models'
import {
  attachShutdownHandler,
  createCollectionEndpoint,
  createSingleEntityEndpoint,
  createSinglePostEndpoint,
} from '@common/service-utils'
import { injector } from './config'
import { PostReplenishment, PostShopping } from './actions'

injector.useRestService<apis.XpenseApi>({
  port: parseInt(sites.services.xpense.internalPort as string, 10),
  deserializeQueryParams: deserialize,
  root: '/api/xpense',
  api: {
    GET: {
      '/shops': createCollectionEndpoint({ model: xpense.Shop }),
      '/shops/:id': createSingleEntityEndpoint({ model: xpense.Shop }),
      '/items': createCollectionEndpoint({ model: xpense.Item }),
      '/items/:id': createSingleEntityEndpoint({ model: xpense.Item }),
      '/accounts': createCollectionEndpoint({ model: xpense.Account }),
      '/accounts/:id': createSingleEntityEndpoint({ model: xpense.Account }),
      '/replenishments': createCollectionEndpoint({ model: xpense.Replenishment }),
      '/replenishments/:id': createSingleEntityEndpoint({ model: xpense.Replenishment }),
      '/shoppings': createCollectionEndpoint({ model: xpense.Shopping }),
      '/shoppings/:id': createSingleEntityEndpoint({ model: xpense.Shopping }),
    },
    POST: {
      '/items': createSinglePostEndpoint(xpense.Item),
      '/shops': createSinglePostEndpoint(xpense.Shop),
      '/accounts': createSinglePostEndpoint(xpense.Account),
      '/:type/:owner/:accountName/replenish': PostReplenishment,
      '/:type/:owner/:accountName/shop': PostShopping,
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
  },
})

attachShutdownHandler(injector)
