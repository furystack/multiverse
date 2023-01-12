import type { media } from '@common/models'
import { tokens } from '@common/config'
import type { Injector } from '@furystack/inject'
import { getLogger } from '@furystack/logging'

export const fetchOmdbSeriesMetadata = async ({
  imdbId,
  injector,
}: {
  imdbId: string
  injector: Injector
}): Promise<media.SeriesOmdbMetadata | undefined> => {
  const query = [`i=${imdbId}`, 'plot=full'].join('&')

  try {
    const omdbResult = await fetch(`http://www.omdbapi.com/?apikey=${tokens.omdbApiKey}&${query}`)
    if (!omdbResult.ok) {
      throw new Error('Failed to fetch OMDb data')
    }
    const omdbMeta: media.SeriesOmdbMetadata = await omdbResult.json()
    return omdbMeta
  } catch (error) {
    getLogger(injector)
      .withScope('fetch-omdb-metadata')
      .warning({ message: `Failed to fetch OMDB Series metadata`, data: { error, imdbId } })
    return undefined
  }
}
