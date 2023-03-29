import { join } from 'path'
import { getRandomString, media } from '@common/models'
import type { Injector } from '@furystack/inject'
import { StoreManager } from '@furystack/core'
import { FileStores } from '@common/config'
import { rimraf } from 'rimraf'
import { existsAsync } from '@common/service-utils'
import { getDataSetFor } from '@furystack/repository'
import { getLogger } from '@furystack/logging'
import { MediaMessaging } from '../services/media-messaging'

export const createEncodingTaskForMovie = async ({ movie, injector }: { movie: media.Movie; injector: Injector }) => {
  injector.getInstance(MediaMessaging) // Has to ensure to it's initialized

  const logger = getLogger(injector).withScope('createEncodingTaskForMovie')
  const library: media.MovieLibrary | undefined = await injector
    .getInstance(StoreManager)
    .getStoreFor(media.MovieLibrary, '_id')
    .get(movie.libraryId)

  if (!library) {
    throw new Error('No Library for movie found, encoding task cannot be created')
  }
  if (library.encoding === false) {
    throw new Error('Encoding has been disabled for the Movie Library, skipping...')
  }
  const targetPath = join(FileStores.encodedMedia, library.encoding.codec, library.encoding.mode, movie._id)
  const targetExists = await existsAsync(targetPath)
  if (targetExists) {
    rimraf(targetPath)
    await logger.verbose({
      message: `The previous encoding data was cleaned up for encoding movie '${movie.metadata.title}' in ${targetPath}`,
      data: {
        targetPath,
        codec: library.encoding.codec,
        mode: library.encoding.mode,
        movie: {
          _id: movie._id,
          title: movie.metadata.title,
        },
      },
    })
  }

  await logger.information({
    message: `A new encoding task has been created for movie ${movie.metadata.title}`,
    data: {
      codec: library.encoding.codec,
      mode: library.encoding.mode,
      movie: {
        _id: movie._id,
        title: movie.metadata.title,
      },
    },
  })

  return await getDataSetFor(injector, media.EncodingTask, '_id').add(injector, {
    authToken: getRandomString(32),
    percent: 0,
    status: 'pending',
    mediaInfo: {
      movie,
      library: { ...library, encoding: library.encoding || media.defaultEncoding },
    },
    creationDate: new Date(),
    log: [],
  })
}
