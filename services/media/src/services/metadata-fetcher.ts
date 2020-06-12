import { Injectable, Injector } from '@furystack/inject'
import { ScopedLogger } from '@furystack/logging'
import { media } from '@common/models'
import { execAsync } from '@common/service-utils'
import got from 'got'
import { tokens } from '@common/config'

@Injectable({ lifetime: 'singleton' })
export class MetadataFetcher {
  public readonly logger: ScopedLogger

  private async tryGetFfprobeData(movie: media.Movie) {
    const ffprobecmd = `ffprobe -v quiet -print_format json -show_format -show_streams -i "${movie.path}`
    try {
      const ffprobeResult = await execAsync(ffprobecmd, {})
      const ffprobe = JSON.parse(ffprobeResult)
      await this.injector.getDataSetFor(media.Movie).update(this.injector, movie._id, { ffprobe })
    } catch (error) {
      this.logger.warning({ message: 'FFProbe failed', data: { movie, ffprobecmd, error } })
    }
  }

  public async tryGetMetadataForMovie(movie: media.Movie): Promise<media.OmdbMetadata> {
    try {
      await this.tryGetFfprobeData(movie)
      const segments = movie.path.split(/\/|\\/g)
      const folder = segments[segments.length - 2]
      const maybeNormalizedName = folder
        .split(/.\d+p./g)[0]
        .split('.')
        .slice(0, -1)
        .join(' ')

      const omdbResult = await got(
        `http://www.omdbapi.com/?apikey=${tokens.omdbApiKey}&t=${encodeURIComponent(maybeNormalizedName)}`,
      )
      const omdbMeta = JSON.parse(omdbResult.body)
      this.injector.getDataSetFor(media.Movie).update(this.injector, movie._id, {
        omdbMeta,
      })
    } catch (error) {
      this.logger.warning({
        message: 'Error getting OMDB data for movie',
        data: { movie, error },
      })
    }
    return {}
  }

  constructor(private readonly injector: Injector) {
    this.logger = injector.logger.withScope('MetadataFetcher')
  }
}
