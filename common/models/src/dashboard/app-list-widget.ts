import { serviceNames } from '../services'
import { WidgetBase } from './widget-base'

export interface AppListWidget extends WidgetBase<'app-list'> {
  title: string
  apps: Array<typeof serviceNames[number]>
}
