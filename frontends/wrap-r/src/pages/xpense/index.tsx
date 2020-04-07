import { Shade, createComponent, Router } from '@furystack/shades'
import { styles } from 'common-components'
import { AccountContext } from './account-context'
import { AccountSelector } from './components/account-selector'

export const XpensePage = Shade<{ accountOwner?: string; accountType?: 'user' | 'organization'; accountName: string }>({
  render: () => {
    return (
      <div style={{ ...styles.glassBox, height: 'calc(100% - 2px)', width: 'calc(100% - 2px)' }}>
        <Router
          notFound={() => (
            <div style={{ padding: '2em', textAlign: 'center' }}>
              <AccountSelector onSelectAccount={(account) => history.pushState({}, '', `/xpense/${account}`)} />
              Select an account first.
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
