import { RequestError } from '@furystack/rest'
import { media } from '@common/models'
import type { RequestAction } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest-service'
import { getDataSetFor } from '@furystack/repository'
import { fetchOmdbMovieMetadata } from '../utils/fetch-omdb-movie-metadata'
import { getUniversalMetadataFromOmdb } from '../utils/get-universal-metadata-from-omdb'
import { getFallbackMetadata } from '../utils/get-fallback-metadata'

export const ReFetchMetadataAction: RequestAction<{ url: { movieId: string }; result: { success: boolean } }> = async ({
  getUrlParams,
  injector,
}) => {
  const { movieId } = getUrlParams()
  const movies = getDataSetFor(injector, media.Movie, '_id')

  const movie = await movies.get(injector, movieId)

  if (!movie) {
    throw new RequestError('Movie not found with id', 404)
  }

  const omdbMeta = await fetchOmdbMovieMetadata({
    title: movie.metadata.title,
    year: movie.metadata.year,
    season: movie.metadata.season,
    episode: movie.metadata.episode,
    injector,
  })
  const metadata = media.isValidOmdbMetadata(omdbMeta)
    ? getUniversalMetadataFromOmdb(omdbMeta)
    : getFallbackMetadata(movie.path)

  await movies.update(injector, movieId, {
    ...(media.isValidOmdbMetadata(omdbMeta) ? { omdbMeta } : {}), //don't override existing, if failed to fetch new
    metadata,
  })

  return JsonResult({ success: true })
}
