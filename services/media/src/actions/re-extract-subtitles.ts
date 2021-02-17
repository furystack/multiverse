import { RequestError } from '@furystack/rest'
import { media } from '@common/models'
import { RequestAction, JsonResult } from '@furystack/rest-service'
import { extractSubtitles } from '../utils/extract-subtitles'

export const ReExtractSubtitles: RequestAction<{ url: { movieId: string }; result: { success: boolean } }> = async ({
  injector,
  getUrlParams,
}) => {
  const { movieId } = getUrlParams()
  const movie = await injector.getDataSetFor(media.Movie).get(injector, movieId)
  if (!movie) {
    throw new RequestError('Movie not found', 404)
  }

  await extractSubtitles({ injector, movie })
  return JsonResult({ success: true })
}
