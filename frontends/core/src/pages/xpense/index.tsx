import { Shade, createComponent, Router, LazyLoad } from '@furystack/shades'
import { styles } from '@furystack/shades-common-components'
import { xpense } from '@common/models'
import { XpenseApiService } from '@common/frontend-utils'
import { Init } from '../init'
import { AccountContext } from './account-context'
import { AccountList } from './account-list'

export const XpensePage = Shade({
  shadowDomName: 'xpense-index',
  render: ({ injector }) => {
    return (
      <div style={{ ...styles.glassBox, height: 'calc(100% - 2px)', width: 'calc(100% - 2px)' }}>
        <Router
          routes={[
            {
              routingOptions: { end: false },
              url: '/xpense/:accountId',
              component: ({ match }) => {
                const accountId = decodeURIComponent(match.params.accountId)
                return (
                  <LazyLoad
                    loader={<Init message="Loading Account..." />}
                    component={async () => {
                      const account: xpense.Account = await injector.getInstance(XpenseApiService).call({
                        method: 'GET',
                        action: '/accounts/:id',
                        query: {},
                        url: { id: accountId, anyád: 2 },
                      })
                      return <AccountContext account={account} />
                    }}
                  />
                )
              },
            },
            {
              url: '/',
              routingOptions: {
                end: false,
              },
              component: () => (
                <LazyLoad
                  loader={<Init message="Loading Accounts..." />}
                  component={async () => {
                    const { entries } = await injector.getInstance(XpenseApiService).call({
                      method: 'GET',
                      action: '/accounts',
                      query: {
                        findOptions: {
                          filter: {},
                          select: ['_id', 'current', 'icon', 'name', 'ownerName', 'ownerType'],
                          order: { name: 'ASC' },
                        },
                      },
                    })
                    return <AccountList accounts={entries as xpense.Account[]} />
                  }}
                />
              ),
            },
          ]}
        />
      </div>
    )
  },
})
