import { Shade, createComponent } from '@furystack/shades'
import { xpense } from '@common/models'
import { IconUrlWidget } from '../../components/dashboard/icon-url-widget'
import { SelectedAccountHeader } from './components/header'

export const AccountDashboard = Shade<xpense.Account>({
  shadowDomName: 'xpense-account-dashboard',
  render: ({ props }) => {
    const accountUriFragment = encodeURI(`${props._id}`)
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
        <div style={{ padding: '1em', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <SelectedAccountHeader area="Dashboard" account={props} />
          <div style={{ flex: '1' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '2em', flexWrap: 'wrap' }}>
          <IconUrlWidget
            icon="💸"
            name="Replenish"
            index={0}
            description={`Add to the balance of ${props.name}`}
            url={`/xpense/${accountUriFragment}/replenish`}
          />
          <IconUrlWidget
            icon="🛒"
            name="Shopping"
            index={1}
            description={`Add to the balance of ${props.name}`}
            url={`/xpense/${accountUriFragment}/shopping`}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '2em', flexWrap: 'wrap' }}>
          <IconUrlWidget
            icon="📉"
            name="History"
            index={1}
            description={`See the history of the balance for ${props.name}`}
            url={`/xpense/${accountUriFragment}/history`}
          />
        </div>
      </div>
    )
  },
})
