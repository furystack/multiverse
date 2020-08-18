import { Injector } from '@furystack/inject'
import { apis, deserialize, xpense } from '@common/models'
import { sites } from '@common/config'
import {
  Authenticate,
  createGetCollectionEndpoint,
  createGetEntityEndpoint,
  createPostEndpoint,
} from '@furystack/rest-service'
import { PostReplenishment, PostShopping } from './actions'

export const setupRestApi = (injector: Injector) => {
  injector.useCommonHttpAuth().useRestService<apis.XpenseApi>({
    port: parseInt(sites.services.xpense.internalPort as string, 10),
    deserializeQueryParams: deserialize,
    root: '/api/xpense',
    api: {
      GET: {
        '/shops': Authenticate()(createGetCollectionEndpoint({ model: xpense.Shop })),
        '/shops/:id': Authenticate()(createGetEntityEndpoint({ model: xpense.Shop })),
        '/items': Authenticate()(createGetCollectionEndpoint({ model: xpense.Item })),
        '/items/:id': Authenticate()(createGetEntityEndpoint({ model: xpense.Item })),
        '/accounts': Authenticate()(createGetCollectionEndpoint({ model: xpense.Account })),
        '/accounts/:id': Authenticate()(createGetEntityEndpoint({ model: xpense.Account })),
        '/replenishments': Authenticate()(createGetCollectionEndpoint({ model: xpense.Replenishment })),
        '/replenishments/:id': Authenticate()(createGetEntityEndpoint({ model: xpense.Replenishment })),
        '/shoppings': Authenticate()(createGetCollectionEndpoint({ model: xpense.Shopping })),
        '/shoppings/:id': Authenticate()(createGetEntityEndpoint({ model: xpense.Shopping })),
      },
      POST: {
        '/items': Authenticate()(createPostEndpoint({ model: xpense.Item })),
        '/shops': Authenticate()(createPostEndpoint({ model: xpense.Shop })),
        '/accounts': Authenticate()(createPostEndpoint({ model: xpense.Account })),
        '/accounts/:accountId/replenish': Authenticate()(PostReplenishment),
        '/accounts/:accountId/shop': Authenticate()(PostShopping),
      },
    },
    cors: {
      credentials: true,
      origins: Object.values(sites.frontends),
    },
  })
}
