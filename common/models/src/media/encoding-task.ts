import { media } from '..'

export class EncodingTask {
  _id!: string
  authToken!: string
  mediaInfo!: {
    movie: media.Movie
    library: media.MovieLibrary
  }
  status!: 'pending' | 'inProgress' | 'finished' | 'failed'
  workerInfo?: {
    name: string
    ip: string
  }
  percent!: number
  creationDate!: Date
  modificationDate!: Date
  startDate?: Date
  finishDate?: Date
  log?: string
}
