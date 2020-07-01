import { media } from '@common/models'
import { fetchOmdbMetadata } from './fetch-omdb-metadata'

export const getMovieMetadata = async (moviePath: string): Promise<media.OmdbMetadata> => {
  try {
    const segments = moviePath.split(/\/|\\/g)
    const folderName = segments[segments.length - 2]
    const omdbMeta = await fetchOmdbMetadata(folderName)
    if (omdbMeta.Response !== 'False') {
      // Success from file Name
      return omdbMeta
    }
    // another try from the File Name
    const fileName = segments[segments.length - 1]
    const omdbFileMeta = await fetchOmdbMetadata(fileName)
    return omdbFileMeta
  } catch (error) {
    return { Response: 'False', Error: error }
  }
}
