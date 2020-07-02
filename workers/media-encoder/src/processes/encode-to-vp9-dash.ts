import { media } from '@common/models'
import { Injector } from '@furystack/inject'
import { ObservableValue, usingAsync } from '@furystack/utils'
import ffmpeg from 'fluent-ffmpeg'
import FormData from 'form-data'
import got from 'got'
import { ChunkUploader } from '../services/chunk-uploader'
import { injector } from '../worker'

export interface EncodeToVp9DashOptions {
  injector: Injector
  source: string
  cwd: string
  task: media.EncodingTask
  uploadPath: string
  encodingSettings: media.Vp9EncodingType
}

export const encodeToVp9Dash = async (options: EncodeToVp9DashOptions) => {
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
      codec: 'libvpx-vp9',
      mode: 'dash',
      retries: 5,
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
        .videoCodec('libvpx-vp9') // ToDo: FFVP9?
        .outputOptions(['-use_template 1', '-use_timeline 1', '-map 0:a', '-quality good'])

      options.encodingSettings.formats.map((format, index) => {
        proc.outputOptions([
          `-filter_complex "[0]format=pix_fmts=yuv420p10le[temp${index}];[temp${index}]scale=-2:${format.downScale}[A${index}]"`,
          `-map [A${index}]:v`,
          `-b:v:${index} ${format.bitrate?.target || 0}k`,
          '-pix_fmt yuv420p10le',
          '-color_primaries 9',
          '-colorspace 9',
          '-color_range 1',
          ...(format.quality ? [`-crf ${format.quality}`] : []),
          ...(format.bitrate?.min ? [`-minrate ${format.bitrate.min}k`] : []),
          ...(format.bitrate?.max ? [`-maxrate ${format.bitrate.max}k`] : []),
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
            logger.information({ message: `ffmpeg vp9 encoding completed` })
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
