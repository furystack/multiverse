import { sites } from '@common/config'
import { apis, deserialize, media } from '@common/models'
import { attachShutdownHandler, runPatches } from '@common/service-utils'
import {
  Authorize,
  Authenticate,
  createGetCollectionEndpoint,
  createGetEntityEndpoint,
  createPostEndpoint,
  createPatchEndpoint,
} from '@furystack/rest-service'
import { injector } from './config'
import { StreamOriginalAction } from './actions/stream-original-action'
import { SaveWatchProgress } from './actions/save-watch-progress'
import { WatchStream } from './actions/watch-stream'
import { UploadEncoded } from './actions/upload-encoded'
import { ReEncodeAction } from './actions/re-encode-action'
import '@furystack/websocket-api'
import { FinializeEncodingAction } from './actions/finialize-encoding'
import { SaveEncodingFailureAction } from './actions/save-encoding-failure'
import { ReFetchMetadataAction } from './actions/re-fetch-metadata'
import { GetWorkerTask } from './actions/get-worker-task'
import { createInitialIndexes } from './patches'
import { UploadSubtitles } from './actions/upload-subtitles'
import { GetAvailableSubtitles } from './actions/get-available-subtitles'
import { GetSubtitle } from './actions/get-subtitle'
import { ReExtractSubtitles } from './actions/re-extract-subtitles'

injector.useRestService<apis.MediaApi>({
  port: parseInt(sites.services.media.internalPort as string, 10),
  deserializeQueryParams: deserialize,
  root: '/api/media',
  api: {
    GET: {
      '/movie-libraries': createGetCollectionEndpoint({ model: media.MovieLibrary }),
      '/movie-libraries/:id': createGetEntityEndpoint({ model: media.MovieLibrary }),
      '/movies': createGetCollectionEndpoint({ model: media.Movie }),
      '/movies/:id': createGetEntityEndpoint({ model: media.Movie }),
      '/movies/:movieId/subtitles': GetAvailableSubtitles,
      '/movies/:movieId/subtitles/:subtitleName': GetSubtitle,
      '/stream-original/:movieId/:accessToken?': StreamOriginalAction,
      '/watch-stream/:id/:codec/:mode/:chunk?': Authenticate()(WatchStream),
      '/my-watch-progress': Authenticate()(createGetCollectionEndpoint({ model: media.MovieWatchHistoryEntry })),
      '/encode/tasks': Authorize('movie-admin')(createGetCollectionEndpoint({ model: media.EncodingTask })),
      '/encode/tasks/:id': Authorize('movie-admin')(createGetEntityEndpoint({ model: media.EncodingTask })),
      '/encode/get-worker-task/:taskId': GetWorkerTask,
    },
    POST: {
      '/movie-libraries': createPostEndpoint({ model: media.MovieLibrary }),
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
      '/movies/:id': Authorize('movie-admin')(createPatchEndpoint({ model: media.Movie })),
      '/movie-libraries/:id': Authorize('movie-admin')(createPatchEndpoint({ model: media.MovieLibrary })),
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

attachShutdownHandler(injector)

runPatches({ injector, appName: 'media', patches: [createInitialIndexes] })
