import { Authenticate } from '@furystack/rest-service'
import { sites } from '@common/config'
import { apis, deserialize, xpense } from '@common/models'
import {
  attachShutdownHandler,
  createCollectionEndpoint,
  createSingleEntityEndpoint,
  createSinglePostEndpoint,
  runPatches,
} from '@common/service-utils'
import { injector } from './config'
import { PostReplenishment, PostShopping } from './actions'
import { createInitialIndexes } from './patches'

injector.useRestService<apis.XpenseApi>({
  port: parseInt(sites.services.xpense.internalPort as string, 10),
  deserializeQueryParams: deserialize,
  root: '/api/xpense',
  api: {
    GET: {
      '/shops': Authenticate()(createCollectionEndpoint({ model: xpense.Shop })),
      '/shops/:id': Authenticate()(createSingleEntityEndpoint({ model: xpense.Shop })),
      '/items': Authenticate()(createCollectionEndpoint({ model: xpense.Item })),
      '/items/:id': Authenticate()(createSingleEntityEndpoint({ model: xpense.Item })),
      '/accounts': Authenticate()(createCollectionEndpoint({ model: xpense.Account })),
      '/accounts/:id': Authenticate()(createSingleEntityEndpoint({ model: xpense.Account })),
      '/replenishments': Authenticate()(createCollectionEndpoint({ model: xpense.Replenishment })),
      '/replenishments/:id': Authenticate()(createSingleEntityEndpoint({ model: xpense.Replenishment })),
      '/shoppings': Authenticate()(createCollectionEndpoint({ model: xpense.Shopping })),
      '/shoppings/:id': Authenticate()(createSingleEntityEndpoint({ model: xpense.Shopping })),
    },
    POST: {
      '/items': Authenticate()(createSinglePostEndpoint(xpense.Item)),
      '/shops': Authenticate()(createSinglePostEndpoint(xpense.Shop)),
      '/accounts': Authenticate()(createSinglePostEndpoint(xpense.Account)),
      '/accounts/:accountId/replenish': Authenticate()(PostReplenishment),
      '/accounts/:accountId/shop': Authenticate()(PostShopping),
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
  },
})

attachShutdownHandler(injector)

runPatches({ injector, appName: 'xpense', patches: [createInitialIndexes] })
