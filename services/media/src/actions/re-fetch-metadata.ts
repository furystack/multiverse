import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { media } from '@common/models'
import { getMovieMetadata } from '../utils/get-movie-metadata'
import { getUniversalMetadataFromOmdb } from '../utils/get-universal-metadata-from-omdb'
import { getFallbackMetadata } from '../utils/get-fallback-metadata'

export const ReFetchMetadataAction: RequestAction<{ urlParams: { movieId: string } }> = async ({
  getUrlParams,
  injector,
}) => {
  const { movieId } = getUrlParams()
  const movies = injector.getDataSetFor(media.Movie)

  const movie = await movies.get(injector, movieId)

  if (!movie) {
    throw new RequestError('Movie not found with id', 404)
  }

  const omdbMeta = await getMovieMetadata(movie.metadata.title)
  const metadata = media.isValidOmdbMetadata(omdbMeta)
    ? getUniversalMetadataFromOmdb(omdbMeta)
    : getFallbackMetadata(movie.path)

  await movies.update(injector, movieId, {
    omdbMeta,
    metadata,
  })

  return JsonResult({ success: true })
}
