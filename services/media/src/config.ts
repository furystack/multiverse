import '@furystack/auth-google'
import '@furystack/repository/dist/injector-extension'
import { existsSync } from 'fs'
import { VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { databases } from '@common/config'
import { media, auth } from '@common/models'
import { AuthorizeOwnership, getOrgsForCurrentUser } from '@common/service-utils'
import { FindOptions } from '@furystack/core'
import { WebSocketApi } from '@furystack/websocket-api'
import { MediaLibraryWatcher } from './services/media-library-watcher'
import { MediaMessaging } from './services/media-messaging'
import { createEncodingTaskForMovie } from './utils/create-encoding-task-for-movie'

export const injector = new Injector()

injector.useDbLogger({ appName: 'media' }).useCommonHttpAuth().useLogging(VerboseConsoleLogger)

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
          owner: {
            type: 'user' as const,
            username: currentUser.username,
          },
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
        injector.getInstance(WebSocketApi).broadcast(async ({ injector: socketInjector, ws }) => {
          if (await socketInjector.isAuthorized('movie-admin')) {
            ws.send(JSON.stringify({ event: 'encoding-task-added', task: entity }))
          }
        })
      },
      onEntityUpdated: async ({ id, change }) => {
        injector.getInstance(WebSocketApi).broadcast(async ({ injector: socketInjector, ws }) => {
          if (await socketInjector.isAuthorized('movie-admin')) {
            ws.send(JSON.stringify({ event: 'encoding-task-updated', id, change }))
          }
        })
      },
      onEntityRemoved: async ({ entity }) => {
        injector.getInstance(WebSocketApi).broadcast(async ({ injector: socketInjector, ws }) => {
          if (await socketInjector.isAuthorized('movie-admin')) {
            ws.send(JSON.stringify({ event: 'encoding-task-updated', task: entity }))
          }
        })
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
    onEntityAdded: async ({ entity, injector: i }) => createEncodingTaskForMovie({ movie: entity, injector: i }),
  }),
)

injector.getInstance(MediaLibraryWatcher)
