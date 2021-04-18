import { RequestError } from '@furystack/rest'
import { media } from '@common/models'
import { RequestAction, JsonResult } from '@furystack/rest-service'
import { fetchOmdbMetadata } from '../utils/fetch-omdb-metadata'
import { getUniversalMetadataFromOmdb } from '../utils/get-universal-metadata-from-omdb'
import { getFallbackMetadata } from '../utils/get-fallback-metadata'

export const ReFetchMetadataAction: RequestAction<{ url: { movieId: string }; result: { success: boolean } }> = async ({
  getUrlParams,
  injector,
}) => {
  const { movieId } = getUrlParams()
  const movies = injector.getDataSetFor(media.Movie, '_id')

  const movie = await movies.get(injector, movieId)

  if (!movie) {
    throw new RequestError('Movie not found with id', 404)
  }

  const omdbMeta = await fetchOmdbMetadata({
    title: movie.metadata.title,
    year: movie.metadata.year,
    season: movie.metadata.season,
    episode: movie.metadata.episode,
  })
  const metadata = media.isValidOmdbMetadata(omdbMeta)
    ? getUniversalMetadataFromOmdb(omdbMeta)
    : getFallbackMetadata(movie.path)

  await movies.update(injector, movieId, {
    omdbMeta,
    metadata,
  })

  return JsonResult({ success: true })
}
