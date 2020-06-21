import { MovieUniversalMetadata } from '@common/models/dist/media/movie-universal-metadata'

export const getFallbackMetadata = (path: string): MovieUniversalMetadata => {
  const segments = path.split(/\/|\\/g)
  const fileName = segments[segments.length - 1]

  const year = parseInt(
    fileName.split(/['.'|' ']/).find((v) => parseInt(v, 10) > 1900 && parseInt(v, 10) < new Date().getFullYear()) ||
      '0',
    10,
  )
  const title = fileName
    .split(year.toString())[0]
    .split(/['.'|' ']/g)
    .join(' ')
  return { title, year, genre: [], duration: 0, thumbnailImageUrl: '', plot: '' }
}
