import { RestApi, RequestAction } from '@furystack/rest'
import { CollectionEndpoint, SingleEntityEndpoint, SinglePostEndpoint, SinglePatchEndpoint } from '../endpoints'
import { Movie, MovieLibrary, MovieWatchHistoryEntry, EncodingTask, EncodingType } from '../media'
import { media } from '..'

export interface MediaApi extends RestApi {
  GET: {
    '/movies': CollectionEndpoint<Movie>
    '/movies/:id': SingleEntityEndpoint<Movie>
    '/movies/:movieId/subtitles': RequestAction<{ urlParams: { movieId: string }; result: string[] }>
    '/movies/:movieId/subtitles/:subtitleName': RequestAction<{ urlParams: { movieId: string; subtitleName: string } }>
    '/movie-libraries': CollectionEndpoint<MovieLibrary>
    '/movie-libraries/:id': SingleEntityEndpoint<MovieLibrary>
    '/stream-original/:movieId/:accessToken?': RequestAction<{ urlParams: { movieId: string; accessToken?: string } }>
    '/watch-stream/:id/:codec/:mode/:chunk?': RequestAction<{
      urlParams: { id: string; codec: EncodingType['codec']; mode: EncodingType['mode']; chunk?: string }
    }>
    '/my-watch-progress': CollectionEndpoint<MovieWatchHistoryEntry>
    '/encode/tasks': CollectionEndpoint<EncodingTask>
    '/encode/tasks/:id': SingleEntityEndpoint<EncodingTask>
    '/encode/get-worker-task/:taskId': RequestAction<{ urlParams: { taskId: string }; result: media.EncodingTask }>
  }
  POST: {
    '/movie-libraries': SinglePostEndpoint<MovieLibrary>
    '/save-watch-progress': RequestAction<{ body: { movieId: string; watchedSeconds: number } }>
    '/upload-encoded/:movieId/:accessToken': RequestAction<{ urlParams: { movieId: string; accessToken: string } }>
    '/upload-subtitles/:movieId/:accessToken': RequestAction<{ urlParams: { movieId: string; accessToken: string } }>
    '/finialize-encoding': RequestAction<{
      body: { accessToken: string; codec: EncodingType['codec']; mode: EncodingType['mode'] }
    }>
    '/save-encoding-failure': RequestAction<{
      body: { accessToken: string; error: any }
    }>
    '/encode/reencode': RequestAction<{ body: { movieId: string } }>
    '/movies/:movieId/re-fetch-metadata': RequestAction<{ urlParams: { movieId: string } }>
  }
  PATCH: {
    '/movies/:id': SinglePatchEndpoint<Movie>
    '/movie-libraries/:id': SinglePatchEndpoint<MovieLibrary>
  }
}
