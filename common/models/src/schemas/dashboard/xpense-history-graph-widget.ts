import { WidgetBase } from './widget-base'

export interface XpenseHistoryGraphWidget extends WidgetBase<'xpense-history-graph'> {
  accountName: string
  accountOwner: string
  accountType: 'user' | 'organization'
  days: number
}
