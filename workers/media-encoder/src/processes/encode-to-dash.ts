import { media } from '@common/models'
import { Injector } from '@furystack/inject'
import { usingAsync } from '@furystack/utils'
import ffmpeg from 'fluent-ffmpeg'
import { ChunkUploader } from '../services/chunk-uploader'
import { injector } from '../worker'

export interface EncodeToDashOptions {
  injector: Injector
  source: string
  cwd: string
  task: media.EncodingTask
}

export const encodeToDash = async (options: EncodeToDashOptions) => {
  const logger = injector.logger.withScope('encodeToDash')

  const encodingSettings = options.task.mediaInfo.library.encoding || media.defaultEncoding

  await usingAsync(
    new ChunkUploader(options.injector, {
      directory: options.cwd,
      isFileAllowed: (fileName) => fileName.endsWith('mpd') || fileName.endsWith('m4s') || fileName.endsWith('webm'),
      parallel: 2,
      task: options.task,
    }),
    async () => {
      logger.verbose({ message: 'Initializing Dash encode...' })

      const originalFfprobeData = options.task.mediaInfo.movie.ffprobe?.streams.find((s) => s.height)

      const proc = ffmpeg({
        source: options.source,
        cwd: options.cwd,
      } as any)
        .output('dash.mpd')
        .format('dash')
        .audioCodec('aac')
        .videoCodec('libvpx-vp9')
        .outputOptions(['-use_template 1', '-use_timeline 1', '-map 0:a', '-b:a 128k', '-quality good'])

      encodingSettings.formats.map((format, index) => {
        proc.outputOptions([
          `-map 0:v`,
          `-b:v:${index} ${format.bitrate?.target || 0}k`,
          ...(format.quality ? [`-crf ${format.quality}`] : []),
          ...(format.bitrate?.min ? [`-minrate ${format.bitrate.min}k`] : []),
          ...(format.bitrate?.max ? [`-maxrate ${format.bitrate.max}k`] : []),
        ])
        if (format.downScale && format.downScale < (originalFfprobeData?.height || 0)) {
          proc.setSize(`?x${format.downScale}`)
        } else {
          logger.verbose({ message: `No downscale needed` })
        }
      })

      proc.on('start', (commandLine) => {
        logger.information({ message: `ffmpeg started with command:${commandLine}`, data: { commandLine } })
      })
      return await new Promise((resolve, reject) => {
        proc
          .on('progress', (info) => {
            logger.information({ message: `ffmpeg progress: ${info.percent}%`, data: { info } })
          })
          .on('end', () => {
            logger.information({ message: `ffmpeg completed` })
            resolve()
          })
          .on('error', (err) => {
            logger.warning({ message: 'ffmpeg errored', data: err })
            reject(err)
          })
        proc.run()
      })
    },
  )
}
