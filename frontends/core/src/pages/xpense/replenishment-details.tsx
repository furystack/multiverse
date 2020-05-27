import { Shade, createComponent } from '@furystack/shades'
import { xpense } from '@common/models'

export const ReplenishmentDetails = Shade<{ replenishment: xpense.Replenishment }>({
  shadowDomName: 'xpense-replenishment-details',

  render: ({ props }) => {
    const { replenishment } = props
    return (
      <pre>
        <code>{JSON.stringify(replenishment, undefined, 2)}</code>
      </pre>
    )
  },
})
