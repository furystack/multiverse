import {
  RestApi,
  RequestAction,
  GetCollectionEndpoint,
  GetEntityEndpoint,
  PostEndpoint,
  PatchEndpoint,
} from '@furystack/rest'
import { LeveledLogEntry } from '@furystack/logging'
import { Movie, MovieLibrary, MovieWatchHistoryEntry, EncodingTask, EncodingType } from '../media'
import { media } from '..'

export interface MediaApi extends RestApi {
  GET: {
    '/movies': GetCollectionEndpoint<Movie>
    '/movies/:id': GetEntityEndpoint<Movie>
    '/movies/:movieId/subtitles': RequestAction<{ urlParams: { movieId: string }; result: string[] }>
    '/movies/:movieId/subtitles/:subtitleName': RequestAction<{ urlParams: { movieId: string; subtitleName: string } }>
    '/movie-libraries': GetCollectionEndpoint<MovieLibrary>
    '/movie-libraries/:id': GetEntityEndpoint<MovieLibrary>
    '/stream-original/:movieId/:accessToken?': RequestAction<{ urlParams: { movieId: string; accessToken?: string } }>
    '/watch-stream/:id/:codec/:mode/:chunk?': RequestAction<{
      urlParams: { id: string; codec: EncodingType['codec']; mode: EncodingType['mode']; chunk?: string }
    }>
    '/my-watch-progress': GetCollectionEndpoint<MovieWatchHistoryEntry>
    '/encode/tasks': GetCollectionEndpoint<EncodingTask>
    '/encode/tasks/:id': GetEntityEndpoint<EncodingTask>
    '/encode/get-worker-task/:taskId': RequestAction<{ urlParams: { taskId: string }; result: media.EncodingTask }>
  }
  POST: {
    '/movie-libraries': PostEndpoint<MovieLibrary>
    '/save-watch-progress': RequestAction<{ body: { movieId: string; watchedSeconds: number } }>
    '/upload-encoded/:movieId/:accessToken': RequestAction<{ urlParams: { movieId: string; accessToken: string } }>
    '/upload-subtitles/:movieId/:accessToken': RequestAction<{ urlParams: { movieId: string; accessToken: string } }>
    '/finialize-encoding': RequestAction<{
      body: {
        accessToken: string
        codec: EncodingType['codec']
        mode: EncodingType['mode']
        log: Array<LeveledLogEntry<any>>
      }
    }>
    '/save-encoding-failure': RequestAction<{
      body: { accessToken: string; error: any; log: Array<LeveledLogEntry<any>> }
    }>
    '/encode/reencode': RequestAction<{ body: { movieId: string } }>
    '/movies/:movieId/re-fetch-metadata': RequestAction<{ urlParams: { movieId: string } }>
    '/movies/:movieId/re-extract-subtitles': RequestAction<{ urlParams: { movieId: string } }>
  }
  PATCH: {
    '/movies/:id': PatchEndpoint<Movie>
    '/movie-libraries/:id': PatchEndpoint<MovieLibrary>
  }
}
