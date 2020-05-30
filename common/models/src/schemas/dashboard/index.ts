import { HtmlWidget } from './html-widget'
import { XpenseHistoryGraphWidget } from './xpense-history-graph-widget'
import { LoggerWidget } from './logger-widget'
import { AppShortcutWidget } from './app-shortcut-widget'
import { IconUrlWidget } from './icon-url-widget'
import { MarkdownWidget } from './markdown-widget'

export { HtmlWidget, XpenseHistoryGraphWidget, LoggerWidget, AppShortcutWidget, IconUrlWidget, MarkdownWidget }

export type Widget =
  | AppShortcutWidget
  | HtmlWidget
  | IconUrlWidget
  | LoggerWidget
  | XpenseHistoryGraphWidget
  | MarkdownWidget

export interface Dashboard {
  name: string
  description: string
  widgets: Widget[]
}
