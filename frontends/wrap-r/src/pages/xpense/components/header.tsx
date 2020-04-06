import { Shade, createComponent } from '@furystack/shades'
import { xpense } from 'common-models'

export const SelectedAccountHeader = Shade<xpense.Account & { subTitle?: string }>({
  render: ({ props }) => {
    return (
      <div>
        <h3 style={{ marginBottom: '0' }}>
          {props.name} {props.subTitle && props.subTitle}
        </h3>
        <h5>Balance: {props.current.toString()}</h5>
      </div>
    )
  },
})
