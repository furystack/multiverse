import { sites } from '@common/config'
import { apis, deserialize, media } from '@common/models'
import {
  attachShutdownHandler,
  createCollectionEndpoint,
  createSingleEntityEndpoint,
  createSinglePostEndpoint,
} from '@common/service-utils'
import { Authenticate } from '@furystack/rest-service'
import { injector } from './config'
import { WatchAction } from './actions/watch'

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
      '/watch/:id': Authenticate()(WatchAction),
    },
    POST: {
      '/movie-libraries': createSinglePostEndpoint(media.MovieLibrary),
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
  },
})

attachShutdownHandler(injector)
