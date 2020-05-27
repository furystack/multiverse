import { RestApi, RequestAction } from '@furystack/rest'
import { Account, Shop, Item, Replenishment, Shopping } from '../xpense'
import { CollectionEndpoint } from '../endpoints/collection-endpoint'
import { SingleEntityEndpoint, SinglePostEndpoint } from '../endpoints'

export interface XpenseApi extends RestApi {
  GET: {
    '/shops': CollectionEndpoint<Shop>
    '/shops/:id': SingleEntityEndpoint<Shop>
    '/items': CollectionEndpoint<Item>
    '/items/:id': SingleEntityEndpoint<Item>
    '/accounts': CollectionEndpoint<Account>
    '/accounts/:id': SingleEntityEndpoint<Account>
    '/shoppings': CollectionEndpoint<Shopping>
    '/shoppings/:id': SingleEntityEndpoint<Shopping>
    '/replenishments': CollectionEndpoint<Replenishment>
    '/replenishments/:id': SingleEntityEndpoint<Replenishment>
  }
  POST: {
    '/accounts': SinglePostEndpoint<Account>
    '/shops': SinglePostEndpoint<Shop>
    '/items': SinglePostEndpoint<Item>
    '/accounts/:accountId/replenish': RequestAction<{
      body: { amount: number; comment?: string; creationDate: string }
      urlParams: { accountId: string }
      result: Replenishment
    }>
    '/accounts/:accountId/shop': RequestAction<{
      body: {
        shopName: string
        creationDate: string
        entries: Array<{ itemName: string; amount: number; unitPrice: number }>
      }
      urlParams: { accountId: string }
      result: Shopping
    }>
  }
}
