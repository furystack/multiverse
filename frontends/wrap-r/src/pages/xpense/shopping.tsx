import { Shade, createComponent } from '@furystack/shades'

export const XpenseShoppingPage = Shade<{
  accountOwner: string
  accountType: 'user' | 'organization'
  accountName: string
}>({
  shadowDomName: 'xpense-shopping-page',
  render: ({ props }) => {
    return <div>Shopping from the account {props.accountName}</div>
  },
})
