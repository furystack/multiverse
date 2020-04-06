import { Shade, createComponent } from '@furystack/shades'
import { xpense } from 'common-models'
import { Widget } from '../welcome-page'
import { AccountSelector } from './components/account-selector'
import { SelectedAccountHeader } from './components/header'

export const AccountDashboard = Shade<xpense.Account>({
  shadowDomName: 'xpense-account-dashboard',
  render: ({ props }) => {
    const accountUriFragment = encodeURI(`${props.ownerType}/${props.ownerName}/${props.name}`)
    return (
      <div style={{ padding: '1em' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <SelectedAccountHeader {...props} />
          <div style={{ flex: '1' }} />
          <AccountSelector onSelectAccount={(account) => history.pushState({}, '', `/xpense/${account}`)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '2em', flexWrap: 'wrap' }}>
          <Widget
            icon="💸"
            name="Replenish"
            index={0}
            description={`Add to the balance of ${props.name}`}
            url={`/xpense/${accountUriFragment}/replenish`}
          />
          <Widget
            icon="🛒"
            name="Shopping"
            index={1}
            description={`Add to the balance of ${props.name}`}
            url={`/xpense/${accountUriFragment}/shopping`}
          />
        </div>
      </div>
    )
  },
})
