import { Injector } from '@furystack/inject'
import { media } from '@common/models'
import { injector } from '../worker'

export interface ExtractSubtitleOptions {
  injector: Injector
  source: string
  cwd: string
  task: media.EncodingTask
  uploadPath: string
  encodingSettings: media.X264EncodingType
}

export const extractSubtitles = async (options: ExtractSubtitleOptions) => {
  const logger = injector.logger.withScope('extractSubtitles')
  if (!options.task.mediaInfo.movie.ffprobe) {
    logger.warning({ message: 'No ffprobe info is available, cannot extract subtitles' })
  }
}
