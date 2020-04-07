import { Shade, createComponent } from '@furystack/shades'
import { xpense } from 'common-models'
import { SelectedAccountHeader } from './components/header'
import { AccountSelector } from './components/account-selector'

export const ItemDetails = Shade<{ item: xpense.Item; account: xpense.Account }>({
  shadowDomName: 'xpense-item-details',
  render: ({ props }) => {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <SelectedAccountHeader area={`${props.item.name} details`} account={props.account} />
          <div style={{ flex: '1' }} />
          <AccountSelector onSelectAccount={(account) => history.pushState({}, '', `/xpense/${account}`)} />
        </div>
        <pre>
          <code>{JSON.stringify(props.item, undefined, 2)}</code>
        </pre>
      </div>
    )
  },
})
