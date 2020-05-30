import { HtmlWidget } from './html-widget'
import { AppShortcutWidget } from './app-shortcut-widget'
import { IconUrlWidget } from './icon-url-widget'
import { MarkdownWidget } from './markdown-widget'

export { HtmlWidget, AppShortcutWidget, IconUrlWidget, MarkdownWidget }

export type Widget = AppShortcutWidget | HtmlWidget | IconUrlWidget | MarkdownWidget

export interface Dashboard {
  name: string
  description: string
  widgets: Widget[]
}
