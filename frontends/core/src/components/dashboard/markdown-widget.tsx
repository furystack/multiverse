import { Shade, createComponent } from '@furystack/shades'
import { dashboard } from '@common/models'
import * as marked from 'marked'

export const MarkdownWidget = Shade<dashboard.MarkdownWidget>({
  shadowDomName: 'markdown-widget',
  render: ({ props, element }) => {
    setTimeout(() => {
      element.innerHTML = marked(props.content)
    }, 1)
    return <div></div>
  },
})
