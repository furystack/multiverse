export class MovieUniversalMetadata {
  title!: string
  year!: number
  duration!: number
  genre!: string[]
  thumbnailImageUrl!: string
  plot!: string
  type!: 'movie' | 'series'
  season?: number
  episode?: number
}
