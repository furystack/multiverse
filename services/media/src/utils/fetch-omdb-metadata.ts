import { media } from '@common/models'
import got from 'got'
import { tokens } from '@common/config'

export const fetchOmdbMetadata = async ({
  title,
  year,
  season,
  episode,
}: {
  title: string
  year?: number
  season?: number
  episode?: number
}) => {
  const query = [
    `t=${encodeURIComponent(title)}`,
    ...(year ? [`y=${year}`] : []),
    ...(season ? [`Season=${season}`] : []),
    ...(episode ? [`Episode=${episode}`] : []),
    'plot=full',
  ].join('&')

  const omdbResult = await got(`http://www.omdbapi.com/?apikey=${tokens.omdbApiKey}&${query}`)
  const omdbMeta: media.OmdbMetadata = JSON.parse(omdbResult.body)
  return omdbMeta
}
