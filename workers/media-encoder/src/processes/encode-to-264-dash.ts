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

  logger.verbose({ message: 'Initializing Dash encode...' })

  const proc = ffmpeg({
    source: options.source,
    cwd: options.cwd,
  } as any)
    .output('dash.mpd')
    .format('dash')
    .audioCodec('aac')
    .audioChannels(2)
    .videoCodec(process.env.ENABLE_NVENC ? 'h264_nvenc' : 'libx264')
    .outputOptions([
      '-use_template 1',
      '-use_timeline 1',
      '-map 0:a',
      '-b:a 96k',
      '-quality good',
      '-reconnect_streamed 1',
      '-reconnect_delay_max 120',
    ])

  options.encodingSettings.formats.map((format, index) => {
    proc.outputOptions([
      `-filter_complex [0]format=pix_fmts=yuv420p[temp${index}];[temp${index}]scale=-2:${format.downScale}[A${index}]`,
      `-map [A${index}]:v`,
      `-b:v:${index} ${format.bitRate || 0}k`,
    ])
  })

  proc.on('start', async (commandLine) => {
    await logger.information({ message: `ffmpeg started with command:${commandLine}`, data: { commandLine } })
  })
  await usingAsync(
    new ChunkUploader({
      injector: options.injector,
      directory: options.cwd,
      isFileAllowed: (fileName) => fileName.endsWith('mpd') || fileName.endsWith('m4s') || fileName.endsWith('webm'),
      parallel: 16,
      task: options.task,
      progress,
      uploadPath: options.uploadPath,
      codec: 'x264',
      mode: 'dash',
      retries: 15,
    }),
    async () => {
      return await new Promise<void>((resolve, reject) => {
        proc
          .on('progress', async (info) => {
            await logger.information({ message: `${info.percent.toFixed(2)}% of x264 encoding completed` })
            progress.setValue(info.percent)
          })
          .on('end', async () => {
            await logger.information({ message: `x264 encoding completed` })
            resolve()
          })
          .on('error', async (error, stdout, stderr) => {
            const form = new FormData({ encoding: 'utf-8' })

            error.stdout = stdout
            error.stderr = stderr

            form.append('error', JSON.stringify(error))
            await got(options.uploadPath, {
              method: 'POST',
              body: form as any,
              encoding: 'utf-8',
              retry: 10,
            })
            await logger.warning({ message: 'ffmpeg errored', data: { error } })
            reject(error)
          })
        proc.run()
      })
    },
  )
}
