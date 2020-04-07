import { Shade, createComponent, RouteLink } from '@furystack/shades'
import { xpense } from 'common-models'

export const SelectedAccountHeader = Shade<{ area: string; account: xpense.Account }>({
  render: ({ props }) => {
    return (
      <div>
        <h3 style={{ marginBottom: '0' }}>{props.area}</h3>
        <h5 style={{ marginTop: '6px' }}>
          {' '}
          <RouteLink href={`/xpense/${props.account.ownerType}/${props.account.ownerName}/${props.account.name}`}>
            💳 {props.account.name}
          </RouteLink>{' '}
          &nbsp; 💲{props.account.current.toString()}{' '}
        </h5>
      </div>
    )
  },
})
