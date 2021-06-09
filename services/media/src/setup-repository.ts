import { Injector } from '@furystack/inject'
import { media, auth } from '@common/models'
import { getOrgsForCurrentUser, AuthorizeOwnership, existsAsync } from '@common/service-utils'
import { FindOptions, IdentityContext } from '@furystack/core'
import { WebSocketApi } from '@furystack/websocket-api'

export const setupRepository = (injector: Injector) => {
  injector.setupRepository((repo) =>
    repo
      .createDataSet(media.Movie, '_id', {
        addFilter: async ({ injector: i, filter }) => {
          const identityContext = i.getInstance(IdentityContext)
          if (identityContext.constructor === IdentityContext) {
            return filter
          }

          const isMovieAdmin = await i.isAuthorized('movie-admin')
          if (isMovieAdmin) {
            return filter
          }

          const movieLibs = await i.getDataSetFor(media.MovieLibrary, '_id').find(i, { select: ['_id'] })
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
            isMovieAdmin || (await i.getDataSetFor(media.MovieLibrary, '_id').get(i, entity.libraryId))
          } catch (error) {
            return { isAllowed: false, message: 'In order to view this movie, you need permisson to its library' }
          }

          return { isAllowed: true }
        },
      })
      .createDataSet(media.MovieLibrary, '_id', {
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
          const isAuthorized = await i.isAuthorized('movie-adimn')
          if (!isAuthorized) {
            const user = await i.getCurrentUser()
            await i.logger.withScope('media-repository').warning({
              message: `User ${user.username} tried add a movie library without movie-admin permission`,
            })
            return { isAllowed: false, message: `Role 'movie-admin' needed` }
          }
          const pathExists = await existsAsync(entity.path as string)
          if (!pathExists) {
            const user = await i.getCurrentUser()
            await i.logger.withScope('media-repository').warning({
              message: `User ${user.username} tried add a movie library without movie-admin permission`,
            })
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
      })
      .createDataSet(media.MovieWatchHistoryEntry, '_id', {
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
          await i.logger.withScope('media-repository').warning({
            message: `User ${user.username} tried to retrieve a watch history entry that doesn't belong to her`,
          })
          return { isAllowed: false, message: 'That entity belongs to another user' }
        },
      })
      .createDataSet(media.EncodingTask, '_id', {
        modifyOnAdd: async ({ entity }) => ({ ...entity, creationDate: new Date() }),
        modifyOnUpdate: async ({ entity }) => ({ ...entity, modificationDate: new Date() }),
      }),
  )

  const taskDataSet = injector.getDataSetFor(media.EncodingTask, '_id')

  const sendUpdate = (change: Partial<media.EncodingTask>) => {
    const api = injector.getInstance(WebSocketApi)
    api.broadcast(async ({ injector: socketInjector, ws }) => {
      const hasPerm = (await socketInjector.getCurrentUser()).roles.includes('movie-admin')
      if (hasPerm) {
        await new Promise<void>((resolve, reject) =>
          ws.send(JSON.stringify({ event: 'update', task: change }), (err) => (err ? reject(err) : resolve())),
        )
      }
    })
  }
  taskDataSet.onEntityUpdated.subscribe(({ change, id }) => sendUpdate({ ...change, _id: id }))
  taskDataSet.onEntityAdded.subscribe(async ({ entity }) => {
    sendUpdate(entity)
  })

  taskDataSet.onEntityRemoved.subscribe(({ key }) => {
    const api = injector.getInstance(WebSocketApi)
    api.broadcast(async ({ injector: socketInjector, ws }) => {
      const hasPerm = (await socketInjector.getCurrentUser()).roles.includes('movie-admin')
      if (hasPerm) {
        await new Promise<void>((resolve, reject) =>
          ws.send(JSON.stringify({ event: 'remove', taskId: key }), (err) => (err ? reject(err) : resolve())),
        )
      }
    })
  })
}
