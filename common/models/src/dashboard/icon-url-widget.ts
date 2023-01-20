import type { Icon } from '../common/icon'
import type { WidgetBase } from './widget-base'

export interface IconUrlWidget extends WidgetBase<'icon-url-widget'> {
  description?: string
  icon: Icon
  name: string
  url: string
}
