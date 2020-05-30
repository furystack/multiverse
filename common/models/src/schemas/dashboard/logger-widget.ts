import { LogLevel } from '@furystack/logging'
import { WidgetBase } from './widget-base'

export interface LoggerWidget extends WidgetBase<'logger'> {
  maxEntries: number
  levels: Array<typeof LogLevel[number]>
}
