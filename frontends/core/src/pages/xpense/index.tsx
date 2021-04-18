import { Shade, createComponent, Router, LazyLoad } from '@furystack/shades'
import { XpenseApiService } from '@common/frontend-utils'
import { Init } from '../init'
import { GenericErrorPage } from '../generic-error'
import { AccountContext } from './account-context'
import { AccountList } from './account-list'

export const XpensePage = Shade({
  shadowDomName: 'xpense-index',
  render: ({ injector }) => {
    return (
      <div style={{ background: 'rgba(128,128,128,0.03)', height: 'calc(100% - 2px)', width: 'calc(100% - 2px)' }}>
        <Router
          routes={[
            {
              routingOptions: { end: false },
              url: '/xpense/:accountId',
              component: ({ match }) => {
                const accountId = decodeURIComponent(match.params.accountId)
                return (
                  <LazyLoad
                    error={(error, retry) => (
                      <GenericErrorPage
                        subtitle="Something bad happened during loading the account"
                        error={error}
                        retry={retry}
                      />
                    )}
                    loader={<Init message="Loading Account..." />}
                    component={async () => {
                      const { result } = await injector.getInstance(XpenseApiService).call({
                        method: 'GET',
                        action: '/accounts/:id',
                        query: {},
                        url: { id: accountId },
                      })
                      return <AccountContext account={result} />
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
                  error={(error, retry) => (
                    <GenericErrorPage
                      subtitle="Something bad happened during loading the account list"
                      error={error}
                      retry={retry}
                    />
                  )}
                  loader={<Init message="Loading Accounts..." />}
                  component={async () => {
                    const { result } = await injector.getInstance(XpenseApiService).call({
                      method: 'GET',
                      action: '/accounts',
                      query: {
                        findOptions: {
                          filter: {},
                          select: ['_id', 'current', 'icon', 'name', 'owner'],
                          order: { name: 'ASC' },
                        },
                      },
                    })
                    return <AccountList accounts={result.entries} />
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
