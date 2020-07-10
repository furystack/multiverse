import { WidgetBase } from './widget-base'

export interface EntityShortcutWidget extends WidgetBase<'entity-shortcut'> {
  entityType: 'movie' | 'dashboard' | 'xpense-account' | 'movie-library'
  id: string
  name?: string
  icon?: string
}
