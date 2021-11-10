import { FFProbeResult } from 'ffprobe'
import { OmdbMetadata } from './omdb-metadata'
import { MovieUniversalMetadata } from './movie-universal-metadata'
import { EncodingType } from './movie-library'

export class Movie {
  _id!: string
  path!: string
  libraryId!: string
  omdbMeta?: OmdbMetadata
  ffprobe!: FFProbeResult
  metadata!: MovieUniversalMetadata
  availableFormats?: Array<{ codec: EncodingType['codec']; mode: EncodingType['mode'] }>
}
