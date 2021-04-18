import { Shade, createComponent, Router, LazyLoad } from '@furystack/shades'
import { xpense } from '@common/models'
import { XpenseApiService } from '@common/frontend-utils'
import { Init } from '../init'
import { GenericErrorPage } from '../generic-error'
import { AccountDashboard } from './account-dashboard'
import { ReplenishPage } from './replenish'
import { XpenseShoppingPage } from './shopping'
import { AccountHistory } from './account-history'
import { ItemDetails } from './item-details'
import { ShoppingDetails } from './shopping-details'
import { ShopDetails } from './shop-details'
import { ReplenishmentDetails } from './replenishment-details'

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
                    const acc = getState().account
                    const updatedAccount = { ...acc, ...account, current: acc.current + r.amount }
                    updateState({ account: updatedAccount })
                  }}
                />
              ),
            },
            {
              url: '/xpense/:accountId/shopping',
              component: () => (
                <LazyLoad
                  error={(error, retry) => (
                    <GenericErrorPage
                      subtitle="Something bad happened during loading the shops or items"
                      error={error}
                      retry={retry}
                    />
                  )}
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
                        shops={shops.result.entries}
                        items={items.result.entries}
                        onShopped={(s) => {
                          const acc = getState().account
                          const updatedAccount = { ...acc, ...account, current: account.current - s.sumAmount }
                          updateState({ account: updatedAccount })
                        }}
                      />
                    )
                  }}
                />
              ),
            },
            {
              url: '/xpense/:accountId/history',
              component: () => <AccountHistory account={account} />,
            },
            {
              url: '/xpense/:accountId/shopping/:shoppingId',
              component: ({ match: m }) => (
                <LazyLoad
                  error={(error, retry) => (
                    <GenericErrorPage
                      subtitle="Something bad happened during loading shopping details"
                      error={error}
                      retry={retry}
                    />
                  )}
                  loader={<Init message="Loading Shopping details..." />}
                  component={async () => {
                    const { result: shopping } = await api.call({
                      method: 'GET',
                      action: '/shoppings/:id',
                      query: {},
                      url: { id: m.params.shoppingId },
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
                  error={(error, retry) => (
                    <GenericErrorPage
                      subtitle="Something bad happened during loading the replenishment details"
                      error={error}
                      retry={retry}
                    />
                  )}
                  loader={<Init message="Loading Replenishment details..." />}
                  component={async () => {
                    const { result: replenishment } = await api.call({
                      method: 'GET',
                      action: '/replenishments/:id',
                      query: {},
                      url: { id: m.params.replenishmentId },
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
                  error={(error, retry) => (
                    <GenericErrorPage
                      subtitle="Something bad happened during loading the shop details"
                      error={error}
                      retry={retry}
                    />
                  )}
                  loader={<Init message="Loading Shop..." />}
                  component={async () => {
                    const { result: shop } = await api.call({
                      method: 'GET',
                      action: '/shops/:id',
                      query: {},
                      url: { id: m.params.shopId },
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
                  error={(error, retry) => (
                    <GenericErrorPage
                      subtitle="Something bad happened during loading the item"
                      error={error}
                      retry={retry}
                    />
                  )}
                  loader={<Init message="Loading item..." />}
                  component={async () => {
                    const { result: item } = await api.call({
                      method: 'GET',
                      action: '/items/:id',
                      url: { id: m.params.itemId },
                      query: {},
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
