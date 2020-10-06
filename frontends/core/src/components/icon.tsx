import { Icon as IconModel } from '@common/models/dist/common'
import { createComponent, PartialElement, Shade } from '@furystack/shades'

export const Icon = Shade<{ icon: IconModel; elementProps?: PartialElement<HTMLElement> }>({
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
