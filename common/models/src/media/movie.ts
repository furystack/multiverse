import { OmdbMetadata } from './omdb-metadata'
import { FfprobeMetadata } from './ffprobe-metadata'

export class Movie {
  _id!: string
  path!: string
  websafePath?: string
  libraryId!: string
  omdbMeta?: OmdbMetadata
  ffprobe?: FfprobeMetadata
}
