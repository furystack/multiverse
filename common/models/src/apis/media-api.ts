import { RestApi, GetCollectionEndpoint, GetEntityEndpoint, PostEndpoint, PatchEndpoint } from '@furystack/rest'
import { LeveledLogEntry } from '@furystack/logging'
import { Movie, MovieLibrary, MovieWatchHistoryEntry, EncodingTask, EncodingType } from '../media'
import { media } from '..'

export interface MediaApi extends RestApi {
  GET: {
    '/movies': GetCollectionEndpoint<Movie>
    '/movies/:id': GetEntityEndpoint<Movie>
    '/movies/:movieId/subtitles': { url: { movieId: string }; result: string[] }
    '/movies/:movieId/subtitles/:subtitleName': {
      url: { movieId: string; subtitleName: string }
      result: unknown
    }
    '/movie-libraries': GetCollectionEndpoint<MovieLibrary>
    '/movie-libraries/:id': GetEntityEndpoint<MovieLibrary>
    '/stream-original/:movieId/:accessToken?': { url: { movieId: string; accessToken?: string }; result: unknown }
    '/watch-stream/:id/:codec/:mode/:chunk?': {
      url: { id: string; codec: EncodingType['codec']; mode: EncodingType['mode']; chunk?: string }
      result: unknown
    }
    '/my-watch-progress': GetCollectionEndpoint<MovieWatchHistoryEntry>
    '/encode/tasks': GetCollectionEndpoint<EncodingTask>
    '/encode/tasks/:id': GetEntityEndpoint<EncodingTask>
    '/encode/get-worker-task/:taskId': { url: { taskId: string }; result: media.EncodingTask }
  }
  POST: {
    '/movie-libraries': PostEndpoint<MovieLibrary>
    '/save-watch-progress': { body: { movieId: string; watchedSeconds: number }; result: unknown }
    '/upload-encoded/:movieId/:accessToken': { url: { movieId: string; accessToken: string }; result: unknown }
    '/upload-subtitles/:movieId/:accessToken': { url: { movieId: string; accessToken: string }; result: unknown }
    '/finialize-encoding': {
      body: {
        accessToken: string
        codec: EncodingType['codec']
        mode: EncodingType['mode']
        log: Array<LeveledLogEntry<any>>
      }
      result: unknown
    }
    '/save-encoding-failure': {
      body: { accessToken: string; error: any; log: Array<LeveledLogEntry<any>> }
      result: unknown
    }
    '/encode/reencode': { body: { movieId: string }; result: unknown }
    '/movies/:movieId/re-fetch-metadata': { url: { movieId: string }; result: unknown }
    '/movies/:movieId/re-extract-subtitles': { url: { movieId: string }; result: unknown }
  }
  PATCH: {
    '/movies/:id': PatchEndpoint<Movie>
    '/movie-libraries/:id': PatchEndpoint<MovieLibrary>
  }
}
