import { Injector } from '@furystack/inject'
import { apis, media } from '@common/models'
import { sites } from '@common/config'
import {
  createGetCollectionEndpoint,
  createGetEntityEndpoint,
  Authenticate,
  Authorize,
  createPostEndpoint,
  createPatchEndpoint,
} from '@furystack/rest-service'
import { GetAvailableSubtitles } from './actions/get-available-subtitles'
import { GetSubtitle } from './actions/get-subtitle'
import { StreamOriginalAction } from './actions/stream-original-action'
import { WatchStream } from './actions/watch-stream'
import { GetWorkerTask } from './actions/get-worker-task'
import { SaveWatchProgress } from './actions/save-watch-progress'
import { UploadEncoded } from './actions/upload-encoded'
import { UploadSubtitles } from './actions/upload-subtitles'
import { ReEncodeAction } from './actions/re-encode-action'
import { FinializeEncodingAction } from './actions/finialize-encoding'
import { SaveEncodingFailureAction } from './actions/save-encoding-failure'
import { ReFetchMetadataAction } from './actions/re-fetch-metadata'
import { ReExtractSubtitles } from './actions/re-extract-subtitles'

export const setupRestApi = (injector: Injector) => {
  injector.useCommonHttpAuth().useRestService<apis.MediaApi>({
    port: parseInt(sites.services.media.internalPort as string, 10),
    root: '/api/media',
    api: {
      GET: {
        '/movie-libraries': createGetCollectionEndpoint({ model: media.MovieLibrary, primaryKey: '_id' }),
        '/movie-libraries/:id': createGetEntityEndpoint({ model: media.MovieLibrary, primaryKey: '_id' }),
        '/movies': createGetCollectionEndpoint({ model: media.Movie, primaryKey: '_id' }),
        '/movies/:id': createGetEntityEndpoint({ model: media.Movie, primaryKey: '_id' }),
        '/movies/:movieId/subtitles': GetAvailableSubtitles,
        '/movies/:movieId/subtitles/:subtitleName': GetSubtitle,
        '/stream-original/:movieId/:accessToken?': StreamOriginalAction,
        '/watch-stream/:id/:codec/:mode/:chunk?': Authenticate()(WatchStream),
        '/my-watch-progress': Authenticate()(
          createGetCollectionEndpoint({ model: media.MovieWatchHistoryEntry, primaryKey: '_id' }),
        ),
        '/encode/tasks': Authorize('movie-admin')(
          createGetCollectionEndpoint({ model: media.EncodingTask, primaryKey: '_id' }),
        ),
        '/encode/tasks/:id': Authorize('movie-admin')(
          createGetEntityEndpoint({ model: media.EncodingTask, primaryKey: '_id' }),
        ),
        '/encode/get-worker-task/:taskId': GetWorkerTask,
      },
      POST: {
        '/movie-libraries': createPostEndpoint({ model: media.MovieLibrary, primaryKey: '_id' }),
        '/save-watch-progress': SaveWatchProgress,
        '/upload-encoded/:movieId/:accessToken': UploadEncoded,
        '/upload-subtitles/:movieId/:accessToken': UploadSubtitles,
        '/encode/reencode': Authorize('movie-admin')(ReEncodeAction),
        '/finialize-encoding': FinializeEncodingAction,
        '/save-encoding-failure': SaveEncodingFailureAction,
        '/movies/:movieId/re-fetch-metadata': Authorize('movie-admin')(ReFetchMetadataAction),
        '/movies/:movieId/re-extract-subtitles': ReExtractSubtitles,
      },
      PATCH: {
        '/movies/:id': Authorize('movie-admin')(createPatchEndpoint({ model: media.Movie, primaryKey: '_id' })),
        '/movie-libraries/:id': Authorize('movie-admin')(
          createPatchEndpoint({ model: media.MovieLibrary, primaryKey: '_id' }),
        ),
      },
    },
    cors: {
      credentials: true,
      origins: Object.values(sites.frontends),
      methods: ['GET', 'POST', 'PATCH'],
    },
  })

  injector.useWebsockets({
    actions: [],
    port: parseInt(sites.services.media.internalPort as string, 10),
    path: '/api/media/encoder-updates',
  })
}
