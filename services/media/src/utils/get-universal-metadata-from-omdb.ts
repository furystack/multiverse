import { media } from '@common/models'

export const getUniversalMetadataFromOmdb = (omdbMeta: media.FetchedOmdbMetadata): media.MovieUniversalMetadata => ({
  title: omdbMeta.Title,
  plot: omdbMeta.Plot,
  year: parseInt(omdbMeta.Year, 10),
  duration: parseInt(omdbMeta.Runtime, 10),
  genre: omdbMeta.Genre.split(',').map((g) => g.trim()),
  thumbnailImageUrl: omdbMeta.Poster,
  type: omdbMeta.Type === 'movie' ? 'movie' : 'episode',
  ...(omdbMeta.Type === 'series'
    ? {
        seriesId: omdbMeta.seriesID,
        season: omdbMeta.Season ? parseInt(omdbMeta.Season, 10) : undefined,
        episode: omdbMeta.Episode ? parseInt(omdbMeta.Episode, 10) : undefined,
      }
    : {}),
})
