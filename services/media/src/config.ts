import '@furystack/auth-google'
import '@furystack/repository/dist/injector-extension'
import { existsSync } from 'fs'
import { ConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'

import { databases } from '@common/config'
import { media } from '@common/models'
import { verifyAndCreateIndexes } from '@common/service-utils'
import { MediaLibraryWatcher } from './services/media-library-watcher'

export const injector = new Injector()

injector.useDbLogger({ appName: 'media' }).useCommonHttpAuth().useLogging(ConsoleLogger)

injector.setupStores((sm) =>
  sm
    .useMongoDb({
      model: media.MovieLibrary,
      primaryKey: '_id',
      url: databases.media.mongoUrl,
      db: databases.media.dbName,
      collection: databases.media.movieLibraries,
    })
    .useMongoDb({
      model: media.Movie,
      primaryKey: '_id',
      url: databases.media.mongoUrl,
      db: databases.media.dbName,
      collection: databases.media.movies,
    }),
)

injector.setupRepository((repo) =>
  repo.createDataSet(media.MovieLibrary, {
    authorizeAdd: async ({ injector: i, entity }) => {
      if (!i.isAuthorized('movie-adimn')) {
        return { isAllowed: false, message: `Role 'movie-admin' needed` }
      }
      if (!existsSync(entity.path as string)) {
        return { isAllowed: false, message: 'Path does not exists or not accessible' }
      }
      return { isAllowed: true }
    },
    modifyOnAdd: async ({ injector: i, entity }) => {
      const currentUser = await i.getCurrentUser()
      return {
        ...entity,
        ownerName: currentUser.username,
      }
    },
    onEntityAdded: ({ injector: i, entity }) => {
      i.getInstance(MediaLibraryWatcher).onLibraryAdded(entity)
    },
    onEntityRemoved: ({ injector: i, entity }) => {
      i.getInstance(MediaLibraryWatcher).onLibraryRemoved(entity)
    },
  }),
)
injector.setupRepository((repo) => repo.createDataSet(media.Movie, {}))

injector.getInstance(MediaLibraryWatcher)

verifyAndCreateIndexes({
  injector,
  model: media.Movie,
  indexName: 'moviePath',
  indexSpecification: { path: 1 },
  indexOptions: { unique: true },
})
