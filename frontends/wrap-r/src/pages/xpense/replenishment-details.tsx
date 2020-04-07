import { Shade, createComponent } from '@furystack/shades'
import { Init } from '../init'

export const ReplenishmentDetails = Shade<{ replenishmentId: string }>({
  shadowDomName: 'xpense-replenishment-details',
  render: () => {
    return <Init message="Retrieving replenishment details..." />
  },
})
