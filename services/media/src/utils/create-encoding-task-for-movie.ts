import { media } from '@common/models'
import { Injector } from '@furystack/inject'
import { StoreManager } from '@furystack/core'
import { v4 } from 'uuid'

export const createEncodingTaskForMovie = async ({ movie, injector }: { movie: media.Movie; injector: Injector }) => {
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
