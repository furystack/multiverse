import { media } from '@common/models'
import got from 'got'
import { tokens } from '@common/config'
import { Injector } from '@furystack/inject'

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
    const omdbResult = await got(`http://www.omdbapi.com/?apikey=${tokens.omdbApiKey}&${query}`)
    const omdbMeta: media.OmdbMetadata = JSON.parse(omdbResult.body)
    return omdbMeta
  } catch (error) {
    injector.logger
      .withScope('fetch-omdb-metadata')
      .warning({ message: `Failed to fetch OMDB Movie metadata`, data: { error, title, year, season, episode } })
    return undefined
  }
}
