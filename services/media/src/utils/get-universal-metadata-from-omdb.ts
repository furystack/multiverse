import { media } from '@common/models'

export const getUniversalMetadataFromOmdb = (omdbMeta: media.FetchedOmdbMetadata): media.MovieUniversalMetadata => ({
  title: omdbMeta.Title,
  plot: omdbMeta.Plot,
  year: parseInt(omdbMeta.Year, 10),
  duration: parseInt(omdbMeta.Runtime, 10),
  genre: omdbMeta.Genre.split(',').map((g) => g.trim()),
  thumbnailImageUrl: omdbMeta.Poster,
  type: omdbMeta.Type,
})
