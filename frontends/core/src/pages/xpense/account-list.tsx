import { Shade, createComponent, LocationService } from '@furystack/shades'
import { xpense } from '@common/models'
import { Fab, colors } from '@furystack/shades-common-components'
import { IconUrlWidget } from '../../components/dashboard/icon-url-widget'

export const AccountList = Shade<{ accounts: xpense.Account[] }>({
  shadowDomName: 'xpense-account-list',

  render: ({ props, injector }) => {
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
          {props.accounts.map((account, index) => (
            <IconUrlWidget
              icon={account.icon || (account.owner.type === 'user' ? '🧑' : '🏢')}
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
