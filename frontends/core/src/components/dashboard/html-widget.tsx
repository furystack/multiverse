import { Shade, createComponent } from '@furystack/shades'
import type { dashboard } from '@common/models'

export const HtmlWidget = Shade<dashboard.HtmlWidget>({
  shadowDomName: 'html-widget',
  render: ({ props, element }) => {
    setTimeout(() => {
      element.innerHTML = props.content
    }, 1)
    return <div></div>
  },
})
