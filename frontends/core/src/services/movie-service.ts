import { MediaApiService } from '@common/frontend-utils'
import { media } from '@common/models'
import { Injectable } from '@furystack/inject'

@Injectable({ lifetime: 'transient' })
export class MovieService {
  public async saveWatchProgress(movie: media.Movie, watchedSeconds: number) {
    this.api.call({
      method: 'POST',
      action: '/save-watch-progress',
      body: { movieId: movie._id, watchedSeconds },
    })
  }

  public async refetchMetadata(movie: media.Movie) {
    return await this.api.call({
      method: 'POST',
      action: '/movies/:movieId/re-fetch-metadata',
      url: { movieId: movie._id },
    })
  }

  public async createEncodeTask(movie: media.Movie) {
    await this.api.call({
      method: 'POST',
      action: '/encode/reencode',
      body: { movieId: movie._id },
    })
  }

  public async reExtractSubtitles(movie: media.Movie) {
    await this.api.call({
      method: 'POST',
      action: '/movies/:movieId/re-extract-subtitles',
      url: { movieId: movie._id },
    })
  }

  constructor(private api: MediaApiService) {}
}
