import { Shade, createComponent, Router, LazyLoad } from '@furystack/shades'
import { xpense } from '@common/models'
import { XpenseApiService } from '@common/frontend-utils'
import { Init } from '../init'
import { AccountDashboard } from './account-dashboard'
import { ReplenishPage } from './replenish'
import { XpenseShoppingPage } from './shopping'
import { AccountHistory } from './account-history'
import { ItemDetails } from './item-details'
import { ShoppingDetails } from './shopping-details'
import { ShopDetails } from './shop-details'
import { ReplenishmentDetails } from './replenishment-details'
import { AvailableAccountsContext } from './services/available-accounts-context'

export const AccountContext = Shade<{ account: xpense.Account }, { account: xpense.Account }>({
  getInitialState: ({ props }) => ({ account: { ...props.account } }),
  shadowDomName: 'xpense-account-context',
  render: ({ getState, injector, updateState }) => {
    const api = injector.getInstance(XpenseApiService)
    const { account } = getState()
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <Router
          routes={[
            {
              url: '/xpense/:accountId/replenish',
              component: () => (
                <ReplenishPage
                  account={account}
                  onReplenished={(r) => {
                    const accountContext = injector.getInstance(AvailableAccountsContext)
                    const updatedAccounts = accountContext.accounts.getValue().map((acc) => {
                      if (acc._id === r.accountId) {
                        const updatedAccount = { ...acc, ...account, current: acc.current + r.amount }
                        updateState({ account: updatedAccount })
                        return updatedAccount
                      }
                      return acc
                    })
                    accountContext.accounts.setValue(updatedAccounts)
                  }}
                />
              ),
            },
            {
              url: '/xpense/:accountId/shopping',
              component: () => (
                <LazyLoad
                  loader={<Init message="Loading Shops and Items..." />}
                  component={async () => {
                    const itemsPromise = api.call({
                      method: 'GET',
                      action: '/items',
                      query: { findOptions: {} },
                    })
                    const shopsPromise = api.call({
                      method: 'GET',
                      action: '/shops',
                      query: { findOptions: {} },
                    })
                    const [items, shops] = await Promise.all([itemsPromise, shopsPromise])
                    return (
                      <XpenseShoppingPage
                        account={account}
                        shops={shops.entries as xpense.Shop[]}
                        items={items.entries as xpense.Item[]}
                        onShopped={(s) => {
                          const accountContext = injector.getInstance(AvailableAccountsContext)
                          const updatedAccounts = accountContext.accounts.getValue().map((acc) => {
                            if (acc._id === s.accountId) {
                              const updatedAccount = { ...acc, ...account, current: account.current - s.sumAmount }
                              updateState({ account: updatedAccount })
                              return updatedAccount
                            }
                            return acc
                          })
                          accountContext.accounts.setValue(updatedAccounts)
                        }}
                      />
                    )
                  }}
                />
              ),
            },
            {
              url: '/xpense/:accountId/history',
              component: ({ match: m }) => (
                <LazyLoad
                  loader={<Init message="Loading Account History..." />}
                  component={async () => {
                    const loadedAccount = await api.call({
                      method: 'GET',
                      action: '/accounts/:id',
                      url: { id: m.params.accountId },
                    })
                    return <AccountHistory account={{ ...account, ...loadedAccount }} />
                  }}
                />
              ),
            },
            {
              url: '/xpense/:accountId/shopping/:shoppingId',
              component: ({ match: m }) => (
                <LazyLoad
                  loader={<Init message="Loading Shopping details..." />}
                  component={async () => {
                    const shopping: xpense.Shopping = await api.call({
                      method: 'GET',
                      action: '/shoppings/:id',
                      query: { id: m.params.shoppingId },
                    })
                    return <ShoppingDetails shopping={shopping} />
                  }}
                />
              ),
            },
            {
              url: '/xpense/:accountId/replenishment/:replenishmentId',
              component: ({ match: m }) => (
                <LazyLoad
                  loader={<Init message="Loading Shop..." />}
                  component={async () => {
                    const replenishment: xpense.Replenishment = await api.call({
                      method: 'GET',
                      action: '/shops/:id',
                      query: { id: m.params.shoppingId },
                    })

                    return <ReplenishmentDetails replenishment={replenishment} />
                  }}
                />
              ),
            },
            {
              url: '/xpense/:accountId/shop/:shopId',
              component: ({ match: m }) => (
                <LazyLoad
                  loader={<Init message="Loading Shop..." />}
                  component={async () => {
                    const shop: xpense.Shop = await api.call({
                      method: 'GET',
                      action: '/shops/:id',
                      query: { id: m.params.shoppingId },
                    })

                    return <ShopDetails shop={shop} />
                  }}
                />
              ),
            },
            {
              url: '/xpense/:accountId/item/:itemId',
              component: ({ match: m }) => (
                <LazyLoad
                  loader={<Init message="Loading item..." />}
                  component={async () => {
                    const item: xpense.Item = await api.call({
                      method: 'GET',
                      action: '/items/:id',
                      query: { id: m.params.itemId },
                    })
                    return <ItemDetails account={account} item={item} />
                  }}
                />
              ),
            },
            {
              url: '/xpense/:accountId',
              component: () => <AccountDashboard {...account} />,
            },
          ]}
        />
      </div>
    )
  },
})
