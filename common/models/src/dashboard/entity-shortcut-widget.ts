import type { Icon } from '../common'
import type { WidgetBase } from './widget-base'

export interface EntityShortcutWidget extends WidgetBase<'entity-shortcut'> {
  /**
   * The Entity Type
   */
  entityType: 'movie' | 'dashboard' | 'movie-library' | 'series'
  /**
   * The Unique identifier
   */
  id: string
  /**
   * A display name
   */
  name?: string
  /**
   * The Icon to display
   */
  icon?: Icon
}
