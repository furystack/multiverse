import type { WidgetBase } from './widget-base'

export interface MovieListWidget extends WidgetBase<'movie-list'> {
  /**
   * The Widget Title
   */
  title: string
  /**
   * A list of movie IDs
   */
  movieIds: string[]
  /**
   * A size of a Movie widget
   */
  size: number
}
