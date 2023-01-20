import type { WidgetBase } from './widget-base'

export interface ContinueMoviesWidget extends WidgetBase<'continue-movies'> {
  /**
   * The number of last seen movies
   */
  count: number
}
