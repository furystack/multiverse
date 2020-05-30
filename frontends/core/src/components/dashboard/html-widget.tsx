import { Shade, createComponent } from '@furystack/shades'
import { HtmlWidget as HtmlWidgetModel } from '@common/models'

export const HtmlWidget = Shade<HtmlWidgetModel>({
  shadowDomName: 'html-widget',
  render: ({ props, element }) => {
    setTimeout(() => {
      element.innerHTML = props.content
    }, 1)
    return <div></div>
  },
})
