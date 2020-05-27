import { Shade, createComponent } from '@furystack/shades'
import { xpense } from '@common/models'

export const ShoppingDetails = Shade<{ shopping: xpense.Shopping }>({
  shadowDomName: 'xpense-shopping-details',
  render: ({ props }) => {
    return (
      <pre>
        <code>{JSON.stringify(props.shopping, undefined, 2)}</code>
      </pre>
    )
  },
})
