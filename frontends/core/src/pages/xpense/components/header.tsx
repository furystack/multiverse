import { Shade, createComponent, RouteLink } from '@furystack/shades'
import { xpense } from '@common/models'

export const SelectedAccountHeader = Shade<{ area: string; account: xpense.Account }>({
  shadowDomName: 'xpense-selected-account-header',
  render: ({ props }) => {
    return (
      <div>
        <h3 style={{ marginBottom: '0' }}>{props.area}</h3>
        <h5 style={{ marginTop: '6px' }}>
          {' '}
          <RouteLink
            title="Account name"
            href={`/xpense/${props.account.ownerType}/${props.account.ownerName}/${props.account.name}`}>
            💳 {props.account.name}
          </RouteLink>
          {props.account.ownerType === 'user' ? (
            <RouteLink href={`/profile/${props.account.ownerName}`} title="The owner user">
              {' '}
              🙅‍♂️ {props.account.ownerName}{' '}
            </RouteLink>
          ) : (
            <RouteLink href={`/organization/${props.account.ownerName}`} title="The owner organization">
              {' '}
              🏢 {props.account.ownerName}{' '}
            </RouteLink>
          )}
          &nbsp; <span className="balance">💲{props.account.current.toString()}</span>
        </h5>
      </div>
    )
  },
})
