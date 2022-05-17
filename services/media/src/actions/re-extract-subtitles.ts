import { RequestError } from '@furystack/rest'
import { media } from '@common/models'
import { RequestAction, JsonResult } from '@furystack/rest-service'
import { getDataSetFor } from '@furystack/repository'
import { getCurrentUser } from '@furystack/core'
import { getLogger } from '@furystack/logging'
import { extractSubtitles } from '../utils/extract-subtitles'

export const ReExtractSubtitles: RequestAction<{ url: { movieId: string }; result: { success: boolean } }> = async ({
  injector,
  getUrlParams,
}) => {
  const logger = getLogger(injector).withScope('re-extract-subtitles')
  const user = await getCurrentUser(injector)
  const { movieId } = getUrlParams()
  const movie = await getDataSetFor(injector, media.Movie, '_id').get(injector, movieId)
  if (!movie) {
    throw new RequestError('Movie not found', 404)
  }

  logger.information({
    message: `User '${user.username}' triggered a subtitle re-extraction for movie '${movie.metadata.title}'`,
    data: {
      user: user.username,
      movie: {
        _id: movie._id,
        title: movie.metadata.title,
      },
    },
  })
  await extractSubtitles({ injector, movie })
  return JsonResult({ success: true })
}
