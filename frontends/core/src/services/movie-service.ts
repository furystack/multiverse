import { useMediaApi } from '@common/frontend-utils'
import { media } from '@common/models'
import { Injectable, Injected, Injector } from '@furystack/inject'

@Injectable({ lifetime: 'transient' })
export class MovieService {
  public async saveWatchProgress(movie: media.Movie, watchedSeconds: number) {
    return await useMediaApi(this.injector)({
      method: 'POST',
      action: '/save-watch-progress',
      body: { movieId: movie._id, watchedSeconds },
    })
  }

  public async refetchMetadata(movie: media.Movie) {
    return await useMediaApi(this.injector)({
      method: 'POST',
      action: '/movies/:movieId/re-fetch-metadata',
      url: { movieId: movie._id },
    })
  }

  public async createEncodeTask(movie: media.Movie) {
    return await useMediaApi(this.injector)({
      method: 'POST',
      action: '/encode/reencode',
      body: { movieId: movie._id },
    })
  }

  public async reExtractSubtitles(movie: media.Movie) {
    return await useMediaApi(this.injector)({
      method: 'POST',
      action: '/movies/:movieId/re-extract-subtitles',
      url: { movieId: movie._id },
    })
  }

  @Injected(Injector)
  private injector!: Injector
}
