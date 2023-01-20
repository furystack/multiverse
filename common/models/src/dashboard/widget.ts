import type { AllMovieLibrariesWidget } from './all-movie-libraries-widget'
import type { AppListWidget } from './app-list-widget'
import type { AppShortcutWidget } from './app-shortcut-widget'
import type { ContinueMoviesWidget } from './continue-movies'
import type { EntityShortcutWidget } from './entity-shortcut-widget'
import type { HtmlWidget } from './html-widget'
import type { IconUrlWidget } from './icon-url-widget'
import type { MarkdownWidget } from './markdown-widget'
import type { MovieListWidget } from './movie-list-widget'
import type { WeatherWidget } from './weather-widget'

export type Widget =
  | AllMovieLibrariesWidget
  | AppShortcutWidget
  | HtmlWidget
  | IconUrlWidget
  | MarkdownWidget
  | MovieListWidget
  | ContinueMoviesWidget
  | AppListWidget
  | EntityShortcutWidget
  | WeatherWidget
