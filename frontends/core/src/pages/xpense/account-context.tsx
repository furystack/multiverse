import { Shade, createComponent, LocationService, Router } from '@furystack/shades'
import { xpense } from '@common/models'
import { XpenseApiService } from '@common/frontend-utils'
import { match } from 'path-to-regexp'
import { Init } from '../init'
import { AccountDashboard } from './account-dashboard'
import { ReplenishPage } from './replenish'
import { XpenseShoppingPage } from './shopping'
import { AccountHistory } from './account-history'
import { ItemDetails } from './item-details'
import { ShoppingDetails } from './shopping-details'
import { ShopDetails } from './shop-details'
import { ReplenishmentDetails } from './replenishment-details'

export const AccountContext = Shade<
  { type: 'user' | 'organization'; accountName: string; owner: string },
  { account?: xpense.Account; items: xpense.Item[]; shops: xpense.Shop[]; isLoading: boolean; error?: Error }
>({
  shadowDomName: 'xpense-account-context',
  getInitialState: () => ({
    isLoading: true,
    items: [],
    shops: [],
  }),
  constructed: ({ injector, updateState, getState }) => {
    const subscriptions = [
      injector.getInstance(LocationService).onLocationChanged.subscribe(async (l) => {
        const matcher = match<{ type: 'user' | 'organization'; owner: string; accountName: string }>(
          '/xpense/:type/:owner/:accountName',
          {
            end: false,
            decode: decodeURIComponent,
          },
        )
        const matched = matcher(l.pathname)
        if (matched) {
          const { account } = getState()
          if (
            !account ||
            account.name !== matched.params.accountName ||
            account.ownerName !== matched.params.owner ||
            account.ownerType !== matched.params.type
          ) {
            updateState({ isLoading: true })
            try {
              const loadedAccount = await injector.getInstance(XpenseApiService).call({
                method: 'GET',
                action: '/:type/:owner/:accountName',
                url: matched.params,
              })
              updateState({ account: loadedAccount })
            } catch (error) {
              updateState({ error })
            } finally {
              updateState({ isLoading: false })
            }
          }
        }
      }, true),
    ]
    injector
      .getInstance(XpenseApiService)
      .call({ method: 'GET', action: '/items' })
      .then((items) => {
        updateState({ items })
      })
    injector
      .getInstance(XpenseApiService)
      .call({ method: 'GET', action: '/shops' })
      .then((shops) => {
        updateState({ shops })
      })
    return () => subscriptions.map((s) => s.dispose())
  },
  render: ({ props, getState, updateState }) => {
    const { account, isLoading, error, shops, items } = getState()
    if (isLoading) {
      return <Init message="Loading account details..." />
    }
    if (error || !account) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 100px',
          }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              perspective: '400px',
              animation: 'shake 150ms 2 linear',
            }}>
            <h1>WhoOoOops... 😱</h1>
            <h3>Failed to load account '{props.accountName}' 😓</h3>
            <p>There was a trouble loading the account.</p>
          </div>
          <a href="/">Reload page</a>
        </div>
      )
    }
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <Router
          routes={[
            {
              url: '/xpense/:type/:owner/:accountName/replenish',
              component: () => (
                <ReplenishPage
                  {...account}
                  onReplenished={(replenishment) => {
                    const { account: acc } = getState()
                    if (acc) {
                      updateState({
                        account: {
                          ...acc,
                          current: acc.current + replenishment.amount,
                          history: [
                            ...acc.history,
                            {
                              balance: acc.current + replenishment.amount,
                              change: replenishment.amount,
                              date: new Date().toISOString(),
                              relatedEntry: {
                                replenishmentId: replenishment._id,
                              },
                            },
                          ],
                        },
                      })
                    }
                  }}
                />
              ),
            },
            {
              url: '/xpense/:type/:owner/:accountName/shopping',
              component: () => (
                <XpenseShoppingPage
                  {...account}
                  shops={shops}
                  items={items}
                  onShopped={(shopping) => {
                    const currentBalance = account.current - shopping.sumAmount
                    updateState({
                      account: {
                        ...account,
                        current: currentBalance,
                        history: [
                          ...account.history,
                          {
                            balance: currentBalance,
                            change: -shopping.sumAmount,
                            date: shopping.creationDate,
                            relatedEntry: { shoppingId: shopping._id },
                          },
                        ],
                      },
                    })
                  }}
                />
              ),
            },
            {
              url: '/xpense/:type/:owner/:accountName/history',
              component: () => <AccountHistory account={account} />,
            },
            {
              url: '/xpense/:type/:owner/:accountName/shopping/:shoppingId',
              component: ({ match: m }) => (
                <ShoppingDetails shoppingId={m.params.shoppingId} account={account} items={items} />
              ),
            },
            {
              url: '/xpense/:type/:owner/:accountName/replenishment/:replenishmentId',
              component: ({ match: m }) => <ReplenishmentDetails replenishmentId={m.params.replenishmentId} />,
            },
            {
              url: '/xpense/:type/:owner/:accountName/shop/:shopId',
              component: ({ match: m }) => <ShopDetails shopId={m.params.shopId} account={account} items={items} />,
            },
            {
              url: '/xpense/:type/:owner/:accountName/item/:itemId',
              component: ({ match: m }) => (
                <ItemDetails account={account} item={items.find((i) => i._id === m.params.itemId) as xpense.Item} />
              ),
            },
            { url: '/', routingOptions: { end: false }, component: () => <AccountDashboard {...account} /> },
          ]}
        />
      </div>
    )
  },
})