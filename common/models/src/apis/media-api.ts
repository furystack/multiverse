import { RestApi, RequestAction } from '@furystack/rest'
import { CollectionEndpoint, SingleEntityEndpoint, SinglePostEndpoint } from '../endpoints'
import { media } from '..'

export interface MediaApi extends RestApi {
  GET: {
    '/movies': CollectionEndpoint<media.Movie>
    '/movies/:movieId': SingleEntityEndpoint<media.Movie>
    '/movie-libraries': CollectionEndpoint<media.MovieLibrary>
    '/movie-libraries/:movieLibraryId': SingleEntityEndpoint<media.MovieLibrary>
    '/demo': RequestAction<{}>
  }
  POST: {
    '/movie-libraries': SinglePostEndpoint<media.MovieLibrary>
  }
}
