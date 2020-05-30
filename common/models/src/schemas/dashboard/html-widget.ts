import { WidgetBase } from './widget-base'

export interface HtmlWidget extends WidgetBase<'html'> {
  content: string
}
