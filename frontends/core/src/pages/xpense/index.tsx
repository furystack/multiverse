import { Shade, createComponent, Router, LocationService, LazyLoad } from '@furystack/shades'
import { styles, Fab, colors } from '@furystack/shades-common-components'
import { xpense } from '@common/models'
import { Widget } from '../welcome-page'
import { Init } from '../init'
import { AccountContext } from './account-context'
import { AvailableAccountsContext } from './services/available-accounts-context'

export const XpensePage = Shade<
  { accountOwner?: string; accountType?: 'user' | 'organization'; accountName: string },
  { availableAccounts: xpense.Account[]; isLoading: boolean }
>({
  shadowDomName: 'xpense-index',
  getInitialState: ({ injector }) => ({
    availableAccounts: injector.getInstance(AvailableAccountsContext).accounts.getValue(),
    isLoading: injector.getInstance(AvailableAccountsContext).isLoading.getValue(),
  }),
  constructed: ({ injector, updateState }) => {
    const accountsCtx = injector.getInstance(AvailableAccountsContext)
    const disposables = [
      accountsCtx.isLoading.subscribe((isLoading) => {
        updateState({ isLoading })
      }),
      accountsCtx.accounts.subscribe((availableAccounts) => updateState({ availableAccounts })),
    ]
    return () => disposables.map((d) => d.dispose())
  },
  render: ({ getState, injector }) => {
    const state = getState()
    if (state.isLoading) {
      return <Init message="Loading Accounts..." />
    }
    return (
      <div style={{ ...styles.glassBox, height: 'calc(100% - 2px)', width: 'calc(100% - 2px)' }}>
        <Router
          notFound={() => (
            <div style={{ overflow: 'auto', width: '100%', height: '100%' }}>
              <div
                style={{
                  padding: '2em',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  overflow: 'auto',
                }}>
                {state.availableAccounts?.map((account, index) => (
                  <Widget
                    icon={account.icon || (account.ownerType === 'user' ? '🧑' : '🏢')}
                    name={account.name}
                    index={index}
                    url={`/xpense/${account._id}`}
                    description=""
                  />
                ))}
                <Fab
                  style={{ backgroundColor: colors.primary.main }}
                  title="Create Account"
                  onclick={() => {
                    history.pushState({}, '', '/xpense/add-account')
                    injector.getInstance(LocationService).updateState()
                  }}>
                  ➕
                </Fab>
              </div>
            </div>
          )}
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
                      const account = getState().availableAccounts.find((acc) => acc._id === accountId)
                      if (!account) {
                        return <div />
                      }
                      // const account: xpense.Account = await injector.getInstance(XpenseApiService).call({
                      //   method: 'GET',
                      //   action: '/accounts/:id',
                      //   query: {},
                      //   url: { id: accountId },
                      // })
                      return <AccountContext account={account} />
                    }}
                  />
                )
              },
            },
          ]}
        />
      </div>
    )
  },
})
