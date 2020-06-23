import { media } from '@common/models'
import { Injector } from '@furystack/inject'
import { ObservableValue, usingAsync } from '@furystack/utils'
import ffmpeg from 'fluent-ffmpeg'
import FormData from 'form-data'
import got from 'got'
import { ChunkUploader } from '../services/chunk-uploader'
import { injector } from '../worker'

export interface EncodeToX264DashOptions {
  injector: Injector
  source: string
  cwd: string
  task: media.EncodingTask
  uploadPath: string
  encodingSettings: media.X264EncodingType
}

export const encodeToX264Dash = async (options: EncodeToX264DashOptions) => {
  const logger = injector.logger.withScope('encodeToDash')

  const progress = new ObservableValue(0)

  await usingAsync(
    new ChunkUploader({
      injector: options.injector,
      directory: options.cwd,
      isFileAllowed: (fileName) => fileName.endsWith('mpd') || fileName.endsWith('m4s') || fileName.endsWith('webm'),
      parallel: 2,
      task: options.task,
      progress,
      uploadPath: options.uploadPath,
      codec: 'x264',
      mode: 'dash',
    }),
    async () => {
      logger.verbose({ message: 'Initializing Dash encode...' })

      const proc = ffmpeg({
        source: options.source,
        cwd: options.cwd,
      } as any)
        .output('dash.mpd')
        .format('dash')
        .audioCodec('aac')
        .audioChannels(2)
        .audioBitrate(128)
        .videoCodec(process.env.ENABLE_NVENC ? 'h264_nvenc' : 'libx264')
        .outputOptions(['-profile high444p', '-use_template 1', '-use_timeline 1', '-map 0:a', '-quality good'])

      options.encodingSettings.formats.map((format, index) => {
        proc.outputOptions([
          `-filter_complex [0]format=pix_fmts=yuv444p[temp${index}];[temp${index}]scale=-2:${format.downScale}[A${index}]`,
          `-map [A${index}]:v`,
          `-b:v:${index} ${format.bitRate || 0}k`,
        ])
      })

      proc.on('start', (commandLine) => {
        logger.information({ message: `ffmpeg started with command:${commandLine}`, data: { commandLine } })
      })
      return await new Promise((resolve, reject) => {
        proc
          .on('progress', (info) => {
            logger.information({ message: `ffmpeg progress: ${info.percent}%`, data: { info } })
            progress.setValue(info.percent)
          })
          .on('end', async () => {
            const form = new FormData({ encoding: 'utf-8' })
            form.append('percent', 100)
            form.append('codec', options.encodingSettings.codec)
            form.append('mode', options.encodingSettings.mode)
            await got(options.uploadPath, {
              method: 'POST',
              body: form as any,
              encoding: 'utf-8',
              retry: { limit: 10, statusCodes: [500] },
            })
            logger.information({ message: `ffmpeg completed` })
            resolve()
          })
          .on('error', async (err) => {
            const form = new FormData({ encoding: 'utf-8' })
            form.append('error', JSON.stringify(err))
            await got(options.uploadPath, {
              method: 'POST',
              body: form as any,
              encoding: 'utf-8',
              retry: { limit: 10, statusCodes: [500] },
            })
            logger.warning({ message: 'ffmpeg errored', data: err })
            reject(err)
          })
        proc.run()
      })
    },
  )
}
