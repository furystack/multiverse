import { WidgetBase } from './widget-base'

export interface MovieListWidget extends WidgetBase<'movie-list'> {
  title: string
  movieIds: string[]
}
