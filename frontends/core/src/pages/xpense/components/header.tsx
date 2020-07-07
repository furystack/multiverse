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
          <RouteLink title="Account name" href={`/xpense/${props.account._id}`}>
            💳 {props.account.name}
          </RouteLink>
          {props.account.owner.type === 'user' ? (
            <RouteLink href={`/profile/${props.account.owner.username}`} title="The owner user">
              {' '}
              🙅‍♂️ {props.account.owner.username}{' '}
            </RouteLink>
          ) : props.account.owner.type === 'organization' ? (
            <RouteLink href={`/organization/${props.account.owner.organizationName}`} title="The owner organization">
              {' '}
              🏢 {props.account.owner.organizationName}{' '}
            </RouteLink>
          ) : null}
          &nbsp; <span className="balance">💲{props.account.current.toString()}</span>
        </h5>
      </div>
    )
  },
})
