import { join } from 'path'
import { media } from '@common/models'
import { Injector } from '@furystack/inject'
import { StoreManager } from '@furystack/core'
import { v4 } from 'uuid'
import { FileStores } from '@common/config'
import rimraf from 'rimraf'
import { existsAsync } from '@common/service-utils'
import { MediaMessaging } from '../services/media-messaging'

export const createEncodingTaskForMovie = async ({ movie, injector }: { movie: media.Movie; injector: Injector }) => {
  injector.getInstance(MediaMessaging) // Has to ensure to it's initialized

  const logger = injector.logger.withScope('createEncodingTaskForMovie')
  const library: media.MovieLibrary | undefined = await injector
    .getInstance(StoreManager)
    .getStoreFor(media.MovieLibrary)
    .get(movie.libraryId)
  if (!library) {
    logger.warning({ message: 'No Library for movie found, encoding task cannot be created' })
    return
  }
  if (library.encoding === false) {
    logger.verbose({ message: 'Encoding has been disabled for the Movie Library, skipping...' })
    return
  }
  const targetPath = join(FileStores.encodedMedia, library.encoding.codec, library.encoding.mode, movie._id)
  const targetExists = await existsAsync(targetPath)
  if (targetExists) {
    await new Promise<void>((resolve, reject) => rimraf(targetPath, {}, (err) => (err ? reject(err) : resolve())))
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

  return await injector.getDataSetFor(media.EncodingTask).add(injector, {
    authToken: v4(),
    percent: 0,
    status: 'pending',
    mediaInfo: {
      movie,
      library: { ...library, encoding: library.encoding || media.defaultEncoding },
    },
  })
}
