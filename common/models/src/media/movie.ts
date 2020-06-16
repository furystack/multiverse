import { OmdbMetadata } from './omdb-metadata'
import { FfprobeMetadata } from './ffprobe-metadata'
import { MovieUniversalMetadata } from './movie-universal-metadata'

export class Movie {
  _id!: string
  path!: string
  websafePath?: string
  libraryId!: string
  omdbMeta?: OmdbMetadata
  ffprobe?: FfprobeMetadata
  metadata!: MovieUniversalMetadata
}
