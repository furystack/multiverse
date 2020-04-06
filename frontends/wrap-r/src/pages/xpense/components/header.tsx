import { Shade, createComponent, RouteLink } from '@furystack/shades'
import { xpense } from 'common-models'

export const SelectedAccountHeader = Shade<xpense.Account & { area: string }>({
  render: ({ props }) => {
    return (
      <div>
        <h3 style={{ marginBottom: '0' }}>{props.area}</h3>
        <h5 style={{ marginTop: '6px' }}>
          {' '}
          <RouteLink href={`/xpense/${props.ownerType}/${props.ownerName}/${props.name}`}>
            💳 {props.name}
          </RouteLink>{' '}
          &nbsp; 💲{props.current.toString()}{' '}
        </h5>
      </div>
    )
  },
})
