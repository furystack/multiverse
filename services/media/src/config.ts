import '@furystack/auth-google'
import '@furystack/repository/dist/injector-extension'
import { existsSync } from 'fs'
import { ConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { databases } from '@common/config'
import { media, auth } from '@common/models'
import { verifyAndCreateIndexes, AuthorizeOwnership, getOrgsForCurrentUser } from '@common/service-utils'
import { FindOptions, StoreManager } from '@furystack/core'
import { v4 } from 'uuid'
import { MediaLibraryWatcher } from './services/media-library-watcher'
import { MediaMessaging } from './services/media-messaging'

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
    })
    .useMongoDb({
      model: media.EncodingTask,
      primaryKey: '_id',
      url: databases.media.mongoUrl,
      db: databases.media.dbName,
      collection: databases.media.encodingTasks,
    }),
)

injector.setupRepository((repo) =>
  repo
    .createDataSet(media.MovieLibrary, {
      addFilter: async ({ injector: i, filter }) => {
        const currentUser = await i.getCurrentUser()
        const orgs = await getOrgsForCurrentUser(i, currentUser)
        return {
          ...filter,
          filter: {
            $and: [
              ...(filter.filter ? [filter.filter] : []),
              {
                $or: [
                  { 'owner.type': 'user', 'owner.username': currentUser.username },
                  ...orgs.map((org) => ({ 'owner.type': 'organization', 'owner.organizationName': org.name })),
                ],
              },
            ],
          },
        } as typeof filter
      },
      authorizeGetEntity: AuthorizeOwnership({ level: ['owner', 'admin', 'member', 'organizationOwner'] }),
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
          encoding: media.defaultEncoding,
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
    })
    .createDataSet(media.EncodingTask, {
      modifyOnAdd: async ({ entity }) => ({ ...entity, creationDate: new Date() }),
      modifyOnUpdate: async ({ entity }) => ({ ...entity, modificationDate: new Date() }),
      onEntityAdded: async ({ entity, injector: i }) => {
        await i.getInstance(MediaMessaging).onEncodeJobAdded(entity)
      },
    }),
)

// ToDo: Check owner / orgs for movie access
injector.setupRepository((repo) =>
  repo.createDataSet(media.Movie, {
    authorizeGetEntity: async ({ injector: i, entity }) => {
      await i.getDataSetFor(media.MovieLibrary).get(i, entity.libraryId)
      return { isAllowed: true }
    },
    onEntityAdded: async ({ entity, injector: i }) => {
      const logger = i.logger.withScope('createEncodingTaskForMovie')
      const library: media.MovieLibrary | undefined = await i
        .getInstance(StoreManager)
        .getStoreFor(media.MovieLibrary)
        .get(entity.libraryId)
      if (!library) {
        logger.warning({ message: 'No Library for movie found, encoding task cannot be created' })
        return
      }
      if (!library.encoding === false) {
        logger.verbose({ message: 'Encoding has been disabled for the Movie Library, skipping...' })
        return
      }
      await i.getDataSetFor(media.EncodingTask).add(i, {
        authToken: v4(),
        percent: 0,
        status: 'pending',
        mediaInfo: {
          movie: entity,
          library: { ...library, encoding: library.encoding || media.defaultEncoding },
        },
      })
    },
  }),
)

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
