import { sites } from '@common/config'
import { apis, deserialize, media } from '@common/models'
import {
  attachShutdownHandler,
  createCollectionEndpoint,
  createSingleEntityEndpoint,
  createSinglePostEndpoint,
  createSinglePatchEndpoint,
  runPatches,
} from '@common/service-utils'
import { Authorize, Authenticate } from '@furystack/rest-service'
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

injector.useRestService<apis.MediaApi>({
  port: parseInt(sites.services.media.internalPort as string, 10),
  deserializeQueryParams: deserialize,
  root: '/api/media',
  api: {
    GET: {
      '/movie-libraries': createCollectionEndpoint({ model: media.MovieLibrary }),
      '/movie-libraries/:id': createSingleEntityEndpoint({ model: media.MovieLibrary }),
      '/movies': createCollectionEndpoint({ model: media.Movie }),
      '/movies/:id': createSingleEntityEndpoint({ model: media.Movie }),
      '/stream-original/:movieId/:accessToken?': StreamOriginalAction,
      '/watch-stream/:id/:codec/:mode/:chunk?': Authenticate()(WatchStream),
      '/my-watch-progress': Authenticate()(createCollectionEndpoint({ model: media.MovieWatchHistoryEntry })),
      '/encode/tasks': Authorize('movie-admin')(createCollectionEndpoint({ model: media.EncodingTask })),
      '/encode/tasks/:id': Authorize('movie-admin')(createSingleEntityEndpoint({ model: media.EncodingTask })),
      '/encode/get-worker-task/:taskId': GetWorkerTask,
    },
    POST: {
      '/movie-libraries': createSinglePostEndpoint(media.MovieLibrary),
      '/save-watch-progress': SaveWatchProgress,
      '/upload-encoded/:movieId/:accessToken': UploadEncoded,
      '/encode/reencode': Authorize('movie-admin')(ReEncodeAction),
      '/finialize-encoding': FinializeEncodingAction,
      '/save-encoding-failure': SaveEncodingFailureAction,
      '/movies/:movieId/re-fetch-metadata': Authorize('movie-admin')(ReFetchMetadataAction),
    },
    PATCH: {
      '/movies/:id': Authorize('movie-admin')(createSinglePatchEndpoint(media.Movie)),
      '/movie-libraries/:id': Authorize('movie-admin')(createSinglePatchEndpoint(media.MovieLibrary)),
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
