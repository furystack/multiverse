export class MovieWatchHistoryEntry {
  _id!: string
  userId!: string
  movieId!: string
  startDate!: Date
  lastWatchDate!: Date
  watchedSeconds!: number
  completed!: boolean
}
