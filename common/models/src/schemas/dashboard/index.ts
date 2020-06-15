import { AppListWidget } from './app-list-widget'
import { AppShortcutWidget } from './app-shortcut-widget'
import { ContinueMoviesWidget } from './continue-movies'
import { HtmlWidget } from './html-widget'
import { IconUrlWidget } from './icon-url-widget'
import { MarkdownWidget } from './markdown-widget'

export { HtmlWidget, AppShortcutWidget, IconUrlWidget, MarkdownWidget, ContinueMoviesWidget, AppListWidget }

export type Widget =
  | AppShortcutWidget
  | HtmlWidget
  | IconUrlWidget
  | MarkdownWidget
  | ContinueMoviesWidget
  | AppListWidget

export interface Dashboard {
  name: string
  description: string
  widgets: Widget[]
}
