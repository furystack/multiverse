import { Shade, createComponent, Router } from '@furystack/shades'
import { styles, Fab, colors } from '@common/components'
import { Widget } from '../welcome-page'
import { AccountContext } from './account-context'
import { AvailableAccountsContext, AvailableAccount } from './services/available-accounts-context'

export const XpensePage = Shade<
  { accountOwner?: string; accountType?: 'user' | 'organization'; accountName: string },
  { availableAccounts?: AvailableAccount[] }
>({
  getInitialState: () => ({ availableAccounts: [] }),
  constructed: ({ injector, updateState }) => {
    injector
      .getInstance(AvailableAccountsContext)
      .accounts.then((availableAccounts) => updateState({ availableAccounts }))
  },
  render: ({ getState }) => {
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
                {getState().availableAccounts?.map((account, index) => (
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
                  onclick={() => history.pushState({}, '', '/xpense/add-account')}>
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
