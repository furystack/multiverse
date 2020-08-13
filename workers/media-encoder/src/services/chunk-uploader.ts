import { Stats, createReadStream } from 'fs'
import { watch, FSWatcher } from 'chokidar'
import { Injector } from '@furystack/inject'
import { ScopedLogger, LeveledLogEntry } from '@furystack/logging'
import { ObservableValue, sleepAsync } from '@furystack/utils'
import Semaphore from 'semaphore-async-await'
import got from 'got'
import { media } from '@common/models'
import FormData from 'form-data'

export interface ChunkWatcherOptions {
  directory: string
  parallel: number
  isFileAllowed: (filename: string) => boolean
  retries: number
  task: media.EncodingTask
  injector: Injector
  progress: ObservableValue<number>
  uploadPath: string
  codec: media.EncodingType['codec']
  mode: media.EncodingType['mode']
}

export class ChunkUploader {
  private warns: Array<{ chunkName: string; error: any }> = []

  public async dispose() {
    await sleepAsync(2000)
    await this.watcher.close()
    for (let index = 0; index < this.options.parallel; index++) {
      await this.lock.acquire()
      if (index <= this.options.parallel) {
        this.logger.verbose({ message: `${index + 1}/${this.options.parallel} upload locks acquired.` })
      }
    }
    if (this.warns) {
      this.logger.warning({ message: 'Encoding finished but some chunk uploads has been failed', data: this.warns })
    } else {
      this.logger.information({ message: 'All uploads finished' })
    }
  }

  private readonly lock = new Semaphore(this.options.parallel)

  private readonly watcher: FSWatcher = watch(this.options.directory, {
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100,
    },
  })
    .on('add', (path, stats) => this.upload(path, parseInt(this.options.progress.getValue().toString(), 10), stats))
    .on('change', (path, stats) => this.upload(path, parseInt(this.options.progress.getValue().toString(), 10), stats))

  private async upload(path: string, percent: number, stats?: Stats) {
    const fileName = path.replace(this.options.directory, '')
    if ((!stats || !stats.isDirectory()) && this.options.isFileAllowed(fileName)) {
      try {
        await this.lock.acquire()
        const form = new FormData({ encoding: 'utf-8' })
        form.append('codec', this.options.codec)
        form.append('mode', this.options.mode)
        form.append('chunk', createReadStream(path) as any)
        form.append('percent', percent)
        await got(this.options.uploadPath, {
          method: 'POST',
          body: form as any,
          encoding: 'utf-8',
          cache: false,
          agent: false,
          retry: { limit: this.options.retries },
          hooks: {
            beforeRetry: [
              async (_options, error, retrycount) => {
                this.logger.information({
                  message: `Chunk upload has been failed, will retry (${retrycount}/${this.options.retries})...`,
                  data: { codec: this.options.codec, mode: this.options.mode, fileName, error, retrycount },
                })
              },
            ],
            beforeError: [
              async (e) => {
                this.logger.information({
                  message: 'Chunk upload has been failed, giving up...',
                  data: { codec: this.options.codec, mode: this.options.mode, fileName, e },
                })
                return e
              },
            ],
          },
        })
        this.logger.verbose({ message: `Chunk '${fileName}' uploaded - ${Math.floor(percent)}% done.` })
      } catch (error) {
        this.logger.warning({
          message: 'Error uploading chunk',
          data: { error, fileName },
        })
        this.warns.push({ chunkName: fileName, error })
      } finally {
        this.lock.release()
      }
    }
  }

  private readonly logger: ScopedLogger

  constructor(private readonly options: ChunkWatcherOptions) {
    this.logger = options.injector.logger.withScope('ChunkUploader')
  }
}
