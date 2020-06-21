import { media } from '@common/models'
import got from 'got'
import { tokens } from '@common/config'

export const fetchOmdbMetadata = async (segment: string) => {
  const maybeNormalizedName = segment
    .split(/.\d+p./g)[0] //e.g. '1080p'
    .split('.')
    .slice(0, -1)
    .join(' ')

  const omdbResult = await got(
    `http://www.omdbapi.com/?apikey=${tokens.omdbApiKey}&t=${encodeURIComponent(maybeNormalizedName)}`,
  )
  const omdbMeta: media.OmdbMetadata = JSON.parse(omdbResult.body)
  return omdbMeta
}
