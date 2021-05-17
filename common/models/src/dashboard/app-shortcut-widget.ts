import { serviceNames } from '../services'
import { WidgetBase } from './widget-base'

export interface AppShortcutWidget extends WidgetBase<'app-shortcut'> {
  /**
   * The Application name
   */
  appName: typeof serviceNames[number]
}
