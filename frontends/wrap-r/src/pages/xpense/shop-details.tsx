import { Shade, createComponent } from '@furystack/shades'
import { xpense } from 'common-models'
import { Init } from '../init'

export const ShopDetails = Shade<{ shopId: string; account: xpense.Account; items: xpense.Item[] }>({
  shadowDomName: 'xpense-shop-details',
  render: () => {
    return <Init message="Retrieving Shop details..." />
  },
})
