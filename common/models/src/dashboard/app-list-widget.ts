import type { serviceNames } from '../services'
import type { WidgetBase } from './widget-base'

export interface AppListWidget extends WidgetBase<'app-list'> {
  /**
   * The Title of the Widget
   */
  title: string
  /**
   * A list of apps to display
   */
  apps: Array<(typeof serviceNames)[number]>
}
