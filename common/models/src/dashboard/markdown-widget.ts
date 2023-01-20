import type { WidgetBase } from './widget-base'

export interface MarkdownWidget extends WidgetBase<'markdown'> {
  content: string
}
