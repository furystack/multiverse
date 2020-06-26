import { Movie } from './movie'
import { MovieLibrary } from './movie-library'

export class EncodingTask {
  _id!: string
  authToken!: string
  mediaInfo!: {
    movie: Movie
    library: MovieLibrary
  }
  status!: 'pending' | 'inProgress' | 'finished' | 'failed' | 'cancelled'
  workerInfo?: {
    ip: string
  }
  percent!: number
  creationDate!: Date
  modificationDate!: Date
  error?: any
  startDate?: Date
  finishDate?: Date
  log?: string
}
