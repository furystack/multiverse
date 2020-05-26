import { RestApi, RequestAction } from '@furystack/rest'
import { FindOptions, PartialResult } from '@furystack/core'
import { Account, Shop, Item, Replenishment, Shopping } from '../xpense'

export interface XpenseApi extends RestApi {
  GET: {
    '/shops': RequestAction<{ result: Shop[] }>
    '/items': RequestAction<{ result: Item[] }>
    '/availableAccounts': RequestAction<{
      result: Array<{
        name: string
        ownerType: Account['ownerType']
        ownerName: Account['ownerName']
        current: Account['current']
      }>
    }>
    '/replenishments/:replenishmentId': RequestAction<{ urlParams: { replenishmentId: string }; result: Replenishment }>
    '/shops/:shopId': RequestAction<{ urlParams: { shopId: string }; result: Shop }>
    '/shopping/:shoppingId': RequestAction<{ urlParams: { shoppingId: string }; result: Shopping }>
    '/:type/:owner/:accountName': RequestAction<{
      result: Account
      urlParams: { type: 'user' | 'organization'; owner: string; accountName: string }
    }>
    '/:type/:owner/:accountName/shoppings': RequestAction<{
      query: { filter: FindOptions<Shopping, any> }
      result: { count: number; entries: Array<PartialResult<Shopping, any>> }
    }>
    '/:type/:owner/:accountName/replenishments': RequestAction<{
      query: { filter: FindOptions<Replenishment, any> }
      result: { count: number; entries: Array<PartialResult<Replenishment, any>> }
    }>
  }
  POST: {
    '/accounts': RequestAction<{ result: Account; body: { name: string; description: string; icon: string } }>
    '/shops': RequestAction<{ result: Shop; body: { name: string } }>
    '/items': RequestAction<{ result: Item; body: { name: string; description: string; category?: string } }>
    '/:type/:owner/:accountName/replenish': RequestAction<{
      body: { amount: number; comment?: string; creationDate: string }
      urlParams: { type: 'user' | 'organization'; owner: string; accountName: string }
      result: Replenishment
    }>
    '/:type/:owner/:accountName/shop': RequestAction<{
      body: {
        shopName: string
        creationDate: string
        entries: Array<{ itemName: string; amount: number; unitPrice: number }>
      }
      urlParams: { type: 'user' | 'organization'; owner: string; accountName: string }
      result: Shopping
    }>
  }
}
