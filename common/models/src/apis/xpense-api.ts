import { RestApi, GetCollectionEndpoint, GetEntityEndpoint, PostEndpoint } from '@furystack/rest'
import { Account, Shop, Item, Replenishment, Shopping } from '../xpense'
export interface XpenseApi extends RestApi {
  GET: {
    '/shops': GetCollectionEndpoint<Shop>
    '/shops/:id': GetEntityEndpoint<Shop, '_id'>
    '/items': GetCollectionEndpoint<Item>
    '/items/:id': GetEntityEndpoint<Item, '_id'>
    '/accounts': GetCollectionEndpoint<Account>
    '/accounts/:id': GetEntityEndpoint<Account, '_id'>
    '/shoppings': GetCollectionEndpoint<Shopping>
    '/shoppings/:id': GetEntityEndpoint<Shopping, '_id'>
    '/replenishments': GetCollectionEndpoint<Replenishment>
    '/replenishments/:id': GetEntityEndpoint<Replenishment, '_id'>
  }
  POST: {
    '/accounts': PostEndpoint<Pick<Account, '_id' | 'name' | 'description'>, '_id'>
    '/shops': PostEndpoint<Shop, '_id'>
    '/items': PostEndpoint<Item, '_id'>
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
