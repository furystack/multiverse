import { RestApi, RequestAction } from '@furystack/rest'
import { CollectionEndpoint, SingleEntityEndpoint, SinglePostEndpoint } from '../endpoints'
import { Movie, MovieLibrary, MovieWatchHistoryEntry } from '../media'

export interface MediaApi extends RestApi {
  GET: {
    '/movies': CollectionEndpoint<Movie>
    '/movies/:id': SingleEntityEndpoint<Movie>
    '/movie-libraries': CollectionEndpoint<MovieLibrary>
    '/movie-libraries/:id': SingleEntityEndpoint<MovieLibrary>
    '/watch/:id': RequestAction<{ urlParams: { id: string } }>
    '/my-watch-progress': CollectionEndpoint<MovieWatchHistoryEntry>
  }
  POST: {
    '/movie-libraries': SinglePostEndpoint<MovieLibrary>
    '/save-watch-progress': RequestAction<{ body: { movieId: string; watchedSeconds: number } }>
  }
}
