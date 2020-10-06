import { Icon } from '../common'
import { WidgetBase } from './widget-base'

export interface IconUrlWidget extends WidgetBase<'icon-url-widget'> {
  description?: string
  icon: Icon
  name: string
  url: string
}
