import { RestApi, RequestAction } from '@furystack/rest'
import { CollectionEndpoint, SingleEntityEndpoint, SinglePostEndpoint, SinglePatchEndpoint } from '../endpoints'
import { Movie, MovieLibrary, MovieWatchHistoryEntry, EncodingTask, EncodingType } from '../media'

export interface MediaApi extends RestApi {
  GET: {
    '/movies': CollectionEndpoint<Movie>
    '/movies/:id': SingleEntityEndpoint<Movie>
    '/movie-libraries': CollectionEndpoint<MovieLibrary>
    '/movie-libraries/:id': SingleEntityEndpoint<MovieLibrary>
    '/stream-original/:movieId/:accessToken?': RequestAction<{ urlParams: { movieId: string; accessToken?: string } }>
    '/watch-stream/:id/:codec/:mode/:chunk?': RequestAction<{
      urlParams: { id: string; codec: EncodingType['codec']; mode: EncodingType['mode']; chunk?: string }
    }>
    '/my-watch-progress': CollectionEndpoint<MovieWatchHistoryEntry>
    '/encode/tasks': CollectionEndpoint<EncodingTask>
  }
  POST: {
    '/movie-libraries': SinglePostEndpoint<MovieLibrary>
    '/save-watch-progress': RequestAction<{ body: { movieId: string; watchedSeconds: number } }>
    '/upload-encoded/:movieId/:accessToken': RequestAction<{ urlParams: { movieId: string; accessToken: string } }>
    '/encode/reencode': RequestAction<{ body: { movieId: string } }>
  }
  PATCH: {
    '/movies/:id': SinglePatchEndpoint<Movie>
  }
}
