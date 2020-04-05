import { RestApi, RequestAction } from '@furystack/rest'
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
    '/:type/:owner/:accountName': RequestAction<{
      result: Account
      query: { type: 'user' | 'organization'; owner: string; accountName: string }
    }>
  }
  POST: {
    '/accounts': RequestAction<{ result: Account; body: { name: string } }>
    '/shops': RequestAction<{ result: Shop; body: { name: string } }>
    '/items': RequestAction<{ result: Item; body: { name: string; description: string; category?: string } }>
    '/:type/:owner/:accountName/replenish': RequestAction<{
      body: { amount: number; comment?: string }
      query: { type: 'user' | 'organization'; owner: string; accountName: string }
      result: Replenishment
    }>
    '/:type/:owner/:accountName/shop': RequestAction<{
      body: Array<{ itemName: string; amount: number; unitPrice: number }>
      query: { type: 'user' | 'organization'; owner: string; accountName: string }
      result: Shopping
    }>
  }
}
