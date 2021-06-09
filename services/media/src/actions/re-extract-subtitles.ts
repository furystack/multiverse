import { RequestError } from '@furystack/rest'
import { media } from '@common/models'
import { RequestAction, JsonResult } from '@furystack/rest-service'
import { extractSubtitles } from '../utils/extract-subtitles'

export const ReExtractSubtitles: RequestAction<{ url: { movieId: string }; result: { success: boolean } }> = async ({
  injector,
  getUrlParams,
}) => {
  const logger = injector.logger.withScope('re-extract-subtitles')
  const user = await injector.getCurrentUser()
  const { movieId } = getUrlParams()
  const movie = await injector.getDataSetFor(media.Movie, '_id').get(injector, movieId)
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
