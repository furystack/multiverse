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

export const defaultDashboard: Dashboard = {
  name: 'Default User Dashboard',
  description: 'The default User dashboard',
  widgets: [
    {
      type: 'continue-movies',
      count: 10,
      minWidth: '100%',
    },
    {
      type: 'app-list',
      title: 'My Favourite Apps',
      minWidth: '256px',
      width: '50%',
      apps: ['Xpense', 'Movies', 'Profile'],
    },
    {
      type: 'app-list',
      title: 'System Apps',
      minWidth: '256px',
      width: '50%',
      apps: ['System Logs', 'Users', 'Diagnostics', 'Organizations', 'Feature Switches'],
    },
  ],
}
