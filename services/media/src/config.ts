import '@furystack/auth-google'
import '@furystack/repository/dist/injector-extension'
import { existsSync } from 'fs'
import { ConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'

import { databases } from '@common/config'
import { media, auth } from '@common/models'
import { verifyAndCreateIndexes } from '@common/service-utils'
import { FindOptions } from '@furystack/core'
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
    })
    .useMongoDb({
      model: media.MovieWatchHistoryEntry,
      primaryKey: '_id',
      url: databases.media.mongoUrl,
      db: databases.media.dbName,
      collection: databases.media.movieWatchEntries,
    }),
)

injector.setupRepository((repo) =>
  repo
    .createDataSet(media.MovieLibrary, {
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
    })
    .createDataSet(media.MovieWatchHistoryEntry, {
      modifyOnAdd: async ({ entity }) => {
        return { ...entity, startDate: new Date() }
      },
      modifyOnUpdate: async ({ entity }) => {
        return { ...entity, lastWatchDate: new Date() }
      },
      addFilter: async ({ injector: i, filter }) => {
        const user = await i.getCurrentUser<auth.User>()
        return { ...filter, filter: { ...filter.filter, userId: { $eq: user._id } } } as FindOptions<
          media.MovieWatchHistoryEntry,
          any
        >
      },
      authorizeGetEntity: async ({ injector: i, entity }) => {
        const user = await i.getCurrentUser<auth.User>()
        if (entity.userId === user._id) {
          return { isAllowed: true }
        }
        return { isAllowed: false, message: 'That entity belongs to another user' }
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

verifyAndCreateIndexes({
  injector,
  model: media.MovieWatchHistoryEntry,
  indexName: 'movieWatchEntryUser',
  indexSpecification: { userId: 1 },
  indexOptions: {},
})
