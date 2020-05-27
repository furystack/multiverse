import { Shade, createComponent, LocationService } from '@furystack/shades'
import { xpense } from '@common/models'
import { Fab, colors } from '@furystack/shades-common-components'
import { Widget } from '../welcome-page'
import { AvailableAccountsContext } from './services/available-accounts-context'

export const AccountList = Shade<unknown, { availableAccounts: xpense.Account[] }>({
  getInitialState: ({ injector }) => ({
    availableAccounts: injector.getInstance(AvailableAccountsContext).accounts.getValue(),
  }),
  shadowDomName: 'xpense-account-list',
  constructed: ({ injector, updateState }) => {
    const subscription = injector
      .getInstance(AvailableAccountsContext)
      .accounts.subscribe((acc) => updateState({ availableAccounts: acc }))
    return () => subscription.dispose()
  },
  render: ({ getState, injector }) => {
    const state = getState()
    return (
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
    )
  },
})
