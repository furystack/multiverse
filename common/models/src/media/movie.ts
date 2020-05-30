import { MovieMetadata } from './movie-metadata'

export class Movie {
  _id!: string
  path!: string
  libraryId!: string
  metadata?: MovieMetadata
}
