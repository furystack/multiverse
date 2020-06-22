import { RestApi, RequestAction } from '@furystack/rest'
import { CollectionEndpoint, SingleEntityEndpoint, SinglePostEndpoint } from '../endpoints'
import { Movie, MovieLibrary, MovieWatchHistoryEntry, EncodingTask } from '../media'

export interface MediaApi extends RestApi {
  GET: {
    '/movies': CollectionEndpoint<Movie>
    '/movies/:id': SingleEntityEndpoint<Movie>
    '/movie-libraries': CollectionEndpoint<MovieLibrary>
    '/movie-libraries/:id': SingleEntityEndpoint<MovieLibrary>
    '/stream-original/:movieId/:accessToken?': RequestAction<{ urlParams: { movieId: string; accessToken?: string } }>
    '/watch-dash/:id/:chunk?': RequestAction<{ urlParams: { id: string; chunk?: string } }>
    '/my-watch-progress': CollectionEndpoint<MovieWatchHistoryEntry>
    '/encode/tasks': CollectionEndpoint<EncodingTask>
    '/encode/reencode/:movieId': RequestAction<{ urlParams: { movieId: string } }>
  }
  POST: {
    '/movie-libraries': SinglePostEndpoint<MovieLibrary>
    '/save-watch-progress': RequestAction<{ body: { movieId: string; watchedSeconds: number } }>
    '/upload-encoded/:movieId/:accessToken': RequestAction<{ urlParams: { movieId: string; accessToken: string } }>
  }
}
