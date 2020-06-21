import { sites } from '@common/config'
import { apis, deserialize, media } from '@common/models'
import {
  attachShutdownHandler,
  createCollectionEndpoint,
  createSingleEntityEndpoint,
  createSinglePostEndpoint,
} from '@common/service-utils'
import { injector } from './config'
import { StreamOriginalAction } from './actions/stream-original-action'
import { SaveWatchProgress } from './actions/save-watch-progress'
import { WatchDash } from './actions/watch-dash'
import { UploadEncoded } from './actions/upload-encoded'

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
      '/stream-original/:movieId/:accessToken': StreamOriginalAction,
      '/watch-dash/:id/:chunk?': WatchDash,
      '/my-watch-progress': createCollectionEndpoint({ model: media.MovieWatchHistoryEntry }),
    },
    POST: {
      '/movie-libraries': createSinglePostEndpoint(media.MovieLibrary),
      '/save-watch-progress': SaveWatchProgress,
      '/upload-encoded/:movieId/:accessToken': UploadEncoded,
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
  },
})

attachShutdownHandler(injector)
