import { Stats, createReadStream } from 'fs'
import { watch, FSWatcher } from 'chokidar'
import { Injector } from '@furystack/inject'
import { ScopedLogger } from '@furystack/logging'
import { ObservableValue, Retrier } from '@furystack/utils'
import Semaphore from 'semaphore-async-await'
import got from 'got'
import { media } from '@common/models'
import FormData from 'form-data'

export interface ChunkWatcherOptions {
  directory: string
  parallel: number
  isFileAllowed: (filename: string) => boolean
  task: media.EncodingTask
  injector: Injector
  progress: ObservableValue<number>
  uploadPath: string
  codec: media.EncodingType['codec']
  mode: media.EncodingType['mode']
}

export class ChunkUploader {
  public async dispose() {
    await this.watcher.close()
    await Retrier.create(async () => {
      const permits = await this.lock.getPermits()
      return permits === this.options.parallel
    })
      .setup({
        timeoutMs: 60 * 1000,
        onSuccess: () => this.logger.information({ message: 'All upload finished, disposing ChunkUploader' }),
        onFail: () =>
          this.logger.warning({ message: 'Could not finish all uploads in time during ChunkUploader dispose' }),
      })
      .run()
  }

  private readonly lock = new Semaphore(this.options.parallel)

  private readonly watcher: FSWatcher = watch(this.options.directory)
    .on('add', (path, stats) => this.upload(path, stats))
    .on('change', (path, stats) => this.upload(path, stats))

  private async upload(path: string, stats?: Stats) {
    const fileName = path.replace(this.options.directory, '')
    if ((!stats || !stats.isDirectory()) && this.options.isFileAllowed(fileName)) {
      try {
        await this.lock.acquire()
        this.logger.verbose({ message: `Starting Chunk upload: '${fileName}'` })

        const form = new FormData({ encoding: 'utf-8' })
        form.append('codec', this.options.codec)
        form.append('mode', this.options.mode)
        form.append('chunk', createReadStream(path) as any)
        try {
          form.append('percent', parseInt(this.options.progress.getValue().toString(), 10))
        } catch (error) {
          // No chunk info from fluent-ffmpeg :(
        }
        await got(this.options.uploadPath, {
          method: 'POST',
          body: form as any,
          encoding: 'utf-8',
          retry: { limit: 30, calculateDelay: ({ attemptCount }) => attemptCount * 1000 * 60 },
        })
        this.logger.verbose({ message: `Finished Chunk upload: '${fileName}'` })
      } catch (error) {
        this.logger.warning({ message: 'Error uploading chunk', data: { error, fileName } })
      } finally {
        this.lock.release()
      }
      this.logger.information({ message: `Starting to upload chunk from '${fileName}'` })
    }
  }

  private readonly logger: ScopedLogger

  constructor(private readonly options: ChunkWatcherOptions) {
    this.logger = options.injector.logger.withScope('ChunkUploader')
  }
}
