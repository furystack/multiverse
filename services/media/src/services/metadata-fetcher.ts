import { Injectable, Injector } from '@furystack/inject'
import { ScopedLogger } from '@furystack/logging'
import { media } from '@common/models'
import { execAsync } from '@common/service-utils'
import got from 'got'
import { tokens } from '@common/config'
import { OmdbMetadata, isValidOmdbMetadata } from '@common/models/dist/media'

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

  private async getOmdbDataFromSegment(segment: string) {
    const maybeNormalizedName = segment
      .split(/.\d+p./g)[0] //e.g. '1080p'
      .split('.')
      .slice(0, -1)
      .join(' ')

    const omdbResult = await got(
      `http://www.omdbapi.com/?apikey=${tokens.omdbApiKey}&t=${encodeURIComponent(maybeNormalizedName)}`,
    )
    const omdbMeta: OmdbMetadata = JSON.parse(omdbResult.body)
    return omdbMeta
  }

  private async updateUniversalMetadataFromOmdb(movie: media.Movie) {
    const reloaded = await this.injector.getDataSetFor(media.Movie).get(this.injector, movie._id)
    const omdbMeta = reloaded?.omdbMeta
    if (reloaded && isValidOmdbMetadata(omdbMeta)) {
      await this.injector.getDataSetFor(media.Movie).update(this.injector, movie._id, {
        metadata: {
          title: omdbMeta.Title,
          plot: omdbMeta.Plot,
          year: parseInt(omdbMeta.Year, 10),
          duration: parseInt(omdbMeta.Runtime, 10),
          genre: omdbMeta.Genre.split(',').map((g) => g.trim()),
          thumbnailImageUrl: omdbMeta.Poster,
        },
      })
    }
  }

  public async tryGetMetadataForMovie(movie: media.Movie) {
    try {
      await this.tryGetFfprobeData(movie)
      const segments = movie.path.split(/\/|\\/g)
      const folderName = segments[segments.length - 2]
      const omdbMeta = await this.getOmdbDataFromSegment(folderName)
      if (omdbMeta.Response !== 'False') {
        // Success from file Name
        this.injector.getDataSetFor(media.Movie).update(this.injector, movie._id, {
          omdbMeta,
        })
      } else {
        // another try from the File Name
        const fileName = segments[segments.length - 2]
        const omdbFileMeta = await this.getOmdbDataFromSegment(fileName)
        this.injector.getDataSetFor(media.Movie).update(this.injector, movie._id, {
          omdbMeta: omdbFileMeta,
        })
      }
      this.updateUniversalMetadataFromOmdb(movie)
    } catch (error) {
      this.logger.warning({
        message: 'Error getting OMDB data for movie',
        data: { movie, error },
      })
    }
  }

  constructor(private readonly injector: Injector) {
    this.logger = injector.logger.withScope('MetadataFetcher')
  }
}
