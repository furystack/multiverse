import { Injector } from '@furystack/inject'
import { media, auth } from '@common/models'
import { getOrgsForCurrentUser, AuthorizeOwnership, existsAsync } from '@common/service-utils'
import { FindOptions, IdentityContext } from '@furystack/core'
import { WebSocketApi } from '@furystack/websocket-api'
import { MediaLibraryWatcher } from './services/media-library-watcher'
import { MediaMessaging } from './services/media-messaging'
import { createEncodingTaskForMovie } from './utils/create-encoding-task-for-movie'

export const setupRepository = (injector: Injector) => {
  injector.setupRepository((repo) =>
    repo
      .createDataSet(media.Movie, {
        // ToDo: authorize update with Movie Admin role
        addFilter: async ({ injector: i, filter }) => {
          const identityContext = i.getInstance(IdentityContext)
          if (identityContext.constructor === IdentityContext) {
            return filter
          }

          const isMovieAdmin = await i.isAuthorized('movie-admin')
          if (isMovieAdmin) {
            return filter
          }

          const movieLibs = await i.getDataSetFor(media.MovieLibrary).find(i, { select: ['_id'] })
          const movieLibIds = movieLibs.map((lib) => lib._id)

          return {
            ...filter,
            filter: {
              $and: [{ libraryId: { $in: movieLibIds } }, filter.filter],
            },
          } as FindOptions<media.Movie, any>
        },
        authorizeGetEntity: async ({ injector: i, entity }) => {
          try {
            const isMovieAdmin = await i.isAuthorized('movie-admin')
            isMovieAdmin || (await i.getDataSetFor(media.MovieLibrary).get(i, entity.libraryId))
          } catch (error) {
            return { isAllowed: false, message: 'In order to view this movie, you need permisson to its library' }
          }

          return { isAllowed: true }
        },
        onEntityAdded: async ({ entity, injector: i }) => createEncodingTaskForMovie({ movie: entity, injector: i }),
      })
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
          const pathExists = await existsAsync(entity.path as string)
          if (!pathExists) {
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
        // ToDo: Authorize update with movie admin role
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
}
