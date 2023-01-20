import type { media } from '@common/models'
import { tokens } from '@common/config'
import type { Injector } from '@furystack/inject'
import { getLogger } from '@furystack/logging'

export const fetchOmdbMovieMetadata = async ({
  title,
  year,
  season,
  episode,
  injector,
}: {
  title: string
  year?: number
  season?: number
  episode?: number
  injector: Injector
}): Promise<media.OmdbMetadata | undefined> => {
  const query = [
    `t=${encodeURIComponent(title)}`,
    ...(year ? [`y=${year}`] : []),
    ...(season ? [`Season=${season}`] : []),
    ...(episode ? [`Episode=${episode}`] : []),
    'plot=full',
  ].join('&')

  try {
    const omdbResult = await fetch(`http://www.omdbapi.com/?apikey=${tokens.omdbApiKey}&${query}`)
    if (!omdbResult.ok) {
      throw new Error('Failed to fetch OMDb data')
    }
    const omdbMeta: media.OmdbMetadata = await omdbResult.json()
    return omdbMeta
  } catch (error) {
    getLogger(injector)
      .withScope('fetch-omdb-metadata')
      .warning({ message: `Failed to fetch OMDB Movie metadata`, data: { error, title, year, season, episode } })
    return undefined
  }
}
