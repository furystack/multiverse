import { Shade, createComponent } from '@furystack/shades'
import type { dashboard } from '@common/models'
import { marked } from 'marked'

export const MarkdownWidget = Shade<dashboard.MarkdownWidget>({
  shadowDomName: 'markdown-widget',
  render: ({ props, element }) => {
    setTimeout(() => {
      element.innerHTML = marked(props.content)
    }, 1)
    return <div></div>
  },
})
