import { AppListWidget } from './app-list-widget'
import { AppShortcutWidget } from './app-shortcut-widget'
import { ContinueMoviesWidget } from './continue-movies'
import { HtmlWidget } from './html-widget'
import { IconUrlWidget } from './icon-url-widget'
import { MarkdownWidget } from './markdown-widget'
import { EntityShortcutWidget } from './entity-shortcut-widget'
import { WeatherData } from './weather-data'
import { WeatherWidget } from './weather-widget'

export * from './dashboard'

export {
  HtmlWidget,
  AppShortcutWidget,
  IconUrlWidget,
  MarkdownWidget,
  ContinueMoviesWidget,
  AppListWidget,
  EntityShortcutWidget,
  WeatherData,
  WeatherWidget,
}

export type Widget =
  | AppShortcutWidget
  | HtmlWidget
  | IconUrlWidget
  | MarkdownWidget
  | ContinueMoviesWidget
  | AppListWidget
  | EntityShortcutWidget
  | WeatherWidget
