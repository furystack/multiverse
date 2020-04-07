import { Shade, createComponent } from '@furystack/shades'
import { xpense } from 'common-models'
import { Init } from '../init'

export const ShoppingDetails = Shade<{ account: xpense.Account; shoppingId: string; items: xpense.Item[] }>({
  shadowDomName: 'xpense-shopping-details',
  render: () => {
    // ToDo: Load shopping
    return <Init message="Getting Shopping info..." />
  },
})
