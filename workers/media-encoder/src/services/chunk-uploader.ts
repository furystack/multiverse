import { Stats, createReadStream, promises } from 'fs'
import { watch, FSWatcher } from 'chokidar'
import { Injector } from '@furystack/inject'
import { ScopedLogger } from '@furystack/logging'
import { ObservableValue } from '@furystack/utils'
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
  public async dispose() {
    await this.watcher.close()
    for (let index = 0; index < this.options.parallel; index++) {
      await this.lock.acquire()
      if (index <= this.options.parallel) {
        this.logger.verbose({ message: `${index}/${this.options.parallel} upload locks acquired.` })
      }
    }
    this.logger.information({ message: 'All uploads finished' })
  }

  private readonly lock = new Semaphore(this.options.parallel)

  private readonly watcher: FSWatcher = watch(this.options.directory, {
    awaitWriteFinish: true,
  })
    .on('add', (path, stats) => this.upload(path, stats))
    .on('change', (path, stats) => this.upload(path, stats))

  private readonly uploadDates = new Map<string, Date>()

  private async upload(path: string, stats?: Stats) {
    const fileName = path.replace(this.options.directory, '')
    if ((!stats || !stats.isDirectory()) && this.options.isFileAllowed(fileName)) {
      try {
        await this.lock.acquire()
        const fileModified = (await promises.stat(path)).mtime

        if (this.uploadDates.has(path) && (this.uploadDates.get(path) as Date) >= fileModified) {
          return
        }

        const form = new FormData({ encoding: 'utf-8' })
        form.append('codec', this.options.codec)
        form.append('mode', this.options.mode)
        form.append('chunk', createReadStream(path) as any)
        form.append('percent', parseInt(this.options.progress.getValue().toString(), 10))
        await got(this.options.uploadPath, {
          method: 'POST',
          body: form as any,
          encoding: 'utf-8',
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
        this.logger.verbose({ message: `Chunk '${fileName}' uploaded.` })
        this.uploadDates.set(path, fileModified)
      } catch (error) {
        this.logger.warning({ message: 'Error uploading chunk', data: { error, fileName } })
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
