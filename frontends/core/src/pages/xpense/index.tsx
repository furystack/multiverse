import { Shade, createComponent, Router, LocationService } from '@furystack/shades'
import { styles, Fab, colors } from '@common/components'
import { Widget } from '../welcome-page'
import { Init } from '../init'
import { AccountContext } from './account-context'
import { AvailableAccountsContext, AvailableAccount } from './services/available-accounts-context'

export const XpensePage = Shade<
  { accountOwner?: string; accountType?: 'user' | 'organization'; accountName: string },
  { availableAccounts: AvailableAccount[]; isLoading: boolean }
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
                    url={`/xpense/${account.ownerType}/${account.ownerName}/${account.name}`}
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
              url: '/xpense/:type/:owner/:accountName',
              component: ({ match }) => (
                <AccountContext
                  accountName={decodeURIComponent(match.params.accountName)}
                  type={match.params.type === 'organization' ? 'organization' : 'user'}
                  owner={decodeURIComponent(match.params.owner)}
                />
              ),
            },
          ]}
        />
      </div>
    )
  },
})
