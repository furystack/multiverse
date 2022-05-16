import { Injector } from '@furystack/inject'
import { media, auth } from '@common/models'
import { getOrgsForCurrentUser, AuthorizeOwnership, existsAsync } from '@common/service-utils'
import { FindOptions, getCurrentUser, IdentityContext, isAuthorized } from '@furystack/core'
import { WebSocketApi } from '@furystack/websocket-api'
import { getDataSetFor, getRepository } from '@furystack/repository'
import { getLogger } from '@furystack/logging'

export const setupRepository = (injector: Injector) => {
  getRepository(injector)
    .createDataSet(media.Movie, '_id', {
      addFilter: async ({ injector: i, filter }) => {
        const identityContext = i.getInstance(IdentityContext)
        if (identityContext.constructor === IdentityContext) {
          return filter
        }

        const isMovieAdmin = await isAuthorized(i, 'movie-admin')
        if (isMovieAdmin) {
          return filter
        }

        const movieLibs = await getDataSetFor(i, media.MovieLibrary, '_id').find(i, { select: ['_id'] })
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
          const isMovieAdmin = await isAuthorized(i, 'movie-admin')
          isMovieAdmin || (await getDataSetFor(i, media.MovieLibrary, '_id').get(i, entity.libraryId))
        } catch (error) {
          const user = await getCurrentUser(i)
          getLogger(i)
            .withScope('media-repository')
            .warning({
              message: `User '${user.username}' tried to access a movie without permission to its library`,
              data: { sendToSlack: true },
            })
          return { isAllowed: false, message: 'In order to view this movie, you need permisson to its library' }
        }

        return { isAllowed: true }
      },
    })
    .createDataSet(media.MovieLibrary, '_id', {
      addFilter: async ({ injector: i, filter }) => {
        const currentUser = await getCurrentUser(i)
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
        const success = await isAuthorized(i, 'movie-admin')
        if (!success) {
          const user = await getCurrentUser(i)
          await getLogger(i)
            .withScope('media-repository')
            .warning({
              message: `User ${user.username} tried add a movie library without movie-admin permission`,
            })
          return { isAllowed: false, message: `Role 'movie-admin' needed` }
        }
        const pathExists = await existsAsync(entity.path as string)
        if (!pathExists) {
          const user = await getCurrentUser(i)
          await getLogger(i)
            .withScope('media-repository')
            .warning({
              message: `User ${user.username} tried add a movie library to a path that doesn't exists`,
              data: { sendToSlack: true },
            })
          return { isAllowed: false, message: 'Path does not exists or not accessible' }
        }
        return { isAllowed: true }
      },
      modifyOnAdd: async ({ injector: i, entity }) => {
        const currentUser = await getCurrentUser(i)
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
        const user = (await getCurrentUser(i)) as auth.User
        return { ...filter, filter: { ...filter.filter, userId: { $eq: user._id } } } as FindOptions<
          media.MovieWatchHistoryEntry,
          any
        >
      },
      authorizeGetEntity: async ({ injector: i, entity }) => {
        const user = (await getCurrentUser(i)) as auth.User
        if (entity.userId === user._id) {
          return { isAllowed: true }
        }
        await getLogger(i)
          .withScope('media-repository')
          .warning({
            message: `User ${user.username} tried to retrieve a watch history entry that doesn't belong to her`,
            data: { sendToSlack: true },
          })
        return { isAllowed: false, message: 'That entity belongs to another user' }
      },
    })
    .createDataSet(media.EncodingTask, '_id', {
      modifyOnAdd: async ({ entity }) => ({ ...entity, creationDate: new Date() }),
      modifyOnUpdate: async ({ entity }) => ({ ...entity, modificationDate: new Date() }),
    })
    .createDataSet(media.Series, '_id', {
      authorizeAdd: async () => ({ isAllowed: false, message: 'Can be added only by system' }),
      authorizeUpdate: async () => ({ isAllowed: false, message: 'Can be updated only by system' }),
      authorizeRemove: async () => ({ isAllowed: false, message: 'Can be removed only by system' }),
    })

  const taskDataSet = getDataSetFor(injector, media.EncodingTask, '_id')

  const sendUpdate = (change: Partial<media.EncodingTask>) => {
    const api = injector.getInstance(WebSocketApi)
    api.broadcast(async ({ injector: socketInjector, ws }) => {
      const hasPerm = (await getCurrentUser(socketInjector)).roles.includes('movie-admin')
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
      const hasPerm = (await getCurrentUser(socketInjector)).roles.includes('movie-admin')
      if (hasPerm) {
        await new Promise<void>((resolve, reject) =>
          ws.send(JSON.stringify({ event: 'remove', taskId: key }), (err) => (err ? reject(err) : resolve())),
        )
      }
    })
  })
}
