import { Injector } from '@furystack/inject'
import { apis, xpense } from '@common/models'
import { sites } from '@common/config'
import {
  Authenticate,
  createGetCollectionEndpoint,
  createGetEntityEndpoint,
  createPostEndpoint,
  useRestService,
} from '@furystack/rest-service'
import { useCommonHttpAuth } from '@common/service-utils/src/use-common-http-auth'
import { PostReplenishment, PostShopping } from './actions'

export const setupRestApi = (injector: Injector) => {
  useCommonHttpAuth(injector)
  useRestService<apis.XpenseApi>({
    injector,
    port: parseInt(sites.services.xpense.internalPort as string, 10),
    root: '/api/xpense',
    api: {
      GET: {
        '/shops': Authenticate()(createGetCollectionEndpoint({ model: xpense.Shop, primaryKey: '_id' })),
        '/shops/:id': Authenticate()(createGetEntityEndpoint({ model: xpense.Shop, primaryKey: '_id' })),
        '/items': Authenticate()(createGetCollectionEndpoint({ model: xpense.Item, primaryKey: '_id' })),
        '/items/:id': Authenticate()(createGetEntityEndpoint({ model: xpense.Item, primaryKey: '_id' })),
        '/accounts': Authenticate()(createGetCollectionEndpoint({ model: xpense.Account, primaryKey: '_id' })),
        '/accounts/:id': Authenticate()(createGetEntityEndpoint({ model: xpense.Account, primaryKey: '_id' })),
        '/replenishments': Authenticate()(
          createGetCollectionEndpoint({ model: xpense.Replenishment, primaryKey: '_id' }),
        ),
        '/replenishments/:id': Authenticate()(
          createGetEntityEndpoint({ model: xpense.Replenishment, primaryKey: '_id' }),
        ),
        '/shoppings': Authenticate()(createGetCollectionEndpoint({ model: xpense.Shopping, primaryKey: '_id' })),
        '/shoppings/:id': Authenticate()(createGetEntityEndpoint({ model: xpense.Shopping, primaryKey: '_id' })),
      },
      POST: {
        '/items': Authenticate()(createPostEndpoint({ model: xpense.Item, primaryKey: '_id' })),
        '/shops': Authenticate()(createPostEndpoint({ model: xpense.Shop, primaryKey: '_id' })),
        '/accounts': Authenticate()(createPostEndpoint({ model: xpense.Account, primaryKey: '_id' })),
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
