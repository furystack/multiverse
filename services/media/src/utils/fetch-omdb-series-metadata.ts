import { media } from '@common/models'
import got from 'got'
import { tokens } from '@common/config'
import { Injector } from '@furystack/inject'
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
    const omdbResult = await got(`http://www.omdbapi.com/?apikey=${tokens.omdbApiKey}&${query}`)
    const omdbMeta: media.SeriesOmdbMetadata = JSON.parse(omdbResult.body)
    return omdbMeta
  } catch (error) {
    getLogger(injector)
      .withScope('fetch-omdb-metadata')
      .warning({ message: `Failed to fetch OMDB Series metadata`, data: { error, imdbId } })
    return undefined
  }
}
