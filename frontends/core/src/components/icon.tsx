import { common } from '@common/models'
import { createComponent, PartialElement, Shade } from '@furystack/shades'

export const Icon = Shade<{ icon: common.Icon; elementProps?: PartialElement<HTMLElement> }>({
  shadowDomName: 'multiverse-icon',
  render: ({ props }) => {
    if (typeof props.icon === 'object') {
      if (props.icon.type === 'flaticon-essential') {
        return (
          <img
            {...props.elementProps}
            src={`/static/icons/flaticon-essential/${props.icon.name}`}
            alt={props.icon.name}
          />
        )
      }
    }
    return <div {...props.elementProps}>{props.icon}</div>
  },
})
