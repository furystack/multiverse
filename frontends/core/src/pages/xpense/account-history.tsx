import { Shade, createComponent, LazyLoad } from '@furystack/shades'
import { Tabs } from '@furystack/shades-common-components'
import { xpense } from '@common/models'
import { XpenseApiService } from '@common/frontend-utils'
import { Init } from '../init'
import { AccountHistoryChart } from './account-history-chart'
import { AccountHistoryShoppings } from './account-history-shoppings'
import { AccountHistoryReplenishments } from './account-history-replenishments'

export const AccountHistory = Shade<{ account: xpense.Account }>({
  shadowDomName: 'xpense-account-history',
  render: ({ props, injector }) => {
    return (
      <Tabs
        tabs={[
          { header: <span>Shoppings</span>, component: <AccountHistoryShoppings account={props.account} /> },
          { header: <span>Replenishments</span>, component: <AccountHistoryReplenishments account={props.account} /> },
          {
            header: <span>History</span>,
            component: (
              <LazyLoad
                loader={<Init message="Loading Account History..." />}
                component={async () => {
                  const loadedAccount = await injector.getInstance(XpenseApiService).call({
                    method: 'GET',
                    action: '/accounts/:id',
                    url: { id: props.account._id },
                    query: {},
                  })
                  return <AccountHistoryChart history={loadedAccount.history} accountId={loadedAccount._id} />
                }}
              />
            ),
          },
        ]}
      />
    )
  },
})
