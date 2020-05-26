import { sites } from '@common/config'
import { apis, deserialize } from '@common/models'
import { attachShutdownHandler } from '@common/service-utils'
import { injector } from './config'
import {
  GetItems,
  GetShops,
  GetAccount,
  PostShop,
  PostItem,
  PostReplenishment,
  PostShopping,
  GetAvailableAccounts,
  PostAccount,
  GetReplenishment,
  GetReplenishments,
  GetShop,
  GetShopping,
  GetShoppings,
} from './actions'

injector.useRestService<apis.XpenseApi>({
  port: parseInt(sites.services.xpense.internalPort as string, 10),
  deserializeQueryParams: deserialize,
  root: '/api/xpense',
  api: {
    GET: {
      '/shops': GetShops,
      '/items': GetItems,
      '/:type/:owner/:accountName': GetAccount,
      '/:type/:owner/:accountName/replenishments': GetReplenishments,
      '/:type/:owner/:accountName/shoppings': GetShoppings,
      '/availableAccounts': GetAvailableAccounts,
      '/replenishments/:replenishmentId': GetReplenishment,
      '/shops/:shopId': GetShop,
      '/shopping/:shoppingId': GetShopping,
    },
    POST: {
      '/items': PostItem,
      '/shops': PostShop,
      '/accounts': PostAccount,
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
