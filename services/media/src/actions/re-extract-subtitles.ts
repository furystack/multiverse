import { RequestAction, RequestError, JsonResult } from '@furystack/rest'
import { media } from '@common/models'
import { extractSubtitles } from '../utils/extract-subtitles'

export const ReExtractSubtitles: RequestAction<{ urlParams: { movieId: string } }> = async ({
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
