import { Shade, createComponent } from '@furystack/shades'
import { MarkdownWidget as MarkdownWidgetModel } from '@common/models'
import marked from 'marked'

export const MarkdownWidget = Shade<MarkdownWidgetModel>({
  shadowDomName: 'markdown-widget',
  render: ({ props, element }) => {
    setTimeout(() => {
      element.innerHTML = marked(props.content)
    }, 1)
    return <div></div>
  },
})
