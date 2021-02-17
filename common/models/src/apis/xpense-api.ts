import { RestApi, GetCollectionEndpoint, GetEntityEndpoint, PostEndpoint } from '@furystack/rest'
import { Account, Shop, Item, Replenishment, Shopping } from '../xpense'
export interface XpenseApi extends RestApi {
  GET: {
    '/shops': GetCollectionEndpoint<Shop>
    '/shops/:id': GetEntityEndpoint<Shop>
    '/items': GetCollectionEndpoint<Item>
    '/items/:id': GetEntityEndpoint<Item>
    '/accounts': GetCollectionEndpoint<Account>
    '/accounts/:id': GetEntityEndpoint<Account>
    '/shoppings': GetCollectionEndpoint<Shopping>
    '/shoppings/:id': GetEntityEndpoint<Shopping>
    '/replenishments': GetCollectionEndpoint<Replenishment>
    '/replenishments/:id': GetEntityEndpoint<Replenishment>
  }
  POST: {
    '/accounts': PostEndpoint<Account>
    '/shops': PostEndpoint<Shop>
    '/items': PostEndpoint<Item>
    '/accounts/:accountId/replenish': {
      body: { amount: number; comment?: string; creationDate: string }
      url: { accountId: string }
      result: Replenishment
    }
    '/accounts/:accountId/shop': {
      body: {
        shopName: string
        creationDate: string
        entries: Array<{ itemName: string; amount: number; unitPrice: number }>
      }
      url: { accountId: string }
      result: Shopping
    }
  }
}
