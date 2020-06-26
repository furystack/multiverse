import { WidgetBase } from './widget-base'

export interface IconUrlWidget extends WidgetBase<'icon-url-widget'> {
  description?: string
  icon: string
  name: string
  url: string
}
