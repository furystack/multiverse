import { Stats, createReadStream, promises } from 'fs'
import { watch, FSWatcher } from 'chokidar'
import { Injector } from '@furystack/inject'
import { getLogger, ScopedLogger } from '@furystack/logging'
import { ObservableValue, sleepAsync } from '@furystack/utils'
import Semaphore from 'semaphore-async-await'
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
        await this.logger.verbose({ message: `${index + 1}/${this.options.parallel} upload locks acquired.` })
      }
    }
    if (this.warns.length) {
      await this.logger.warning({
        message: 'Encoding finished but some chunk uploads has been failed',
        data: this.warns,
      })
    } else {
      await this.logger.information({ message: 'All uploads finished' })
    }
  }

  private readonly lock = new Semaphore(this.options.parallel)

  private readonly watcher: FSWatcher = watch(this.options.directory, {
    awaitWriteFinish: {
      pollInterval: 250,
      stabilityThreshold: 500,
    },
  })
    .on('add', async (path, stats) => {
      await this.upload(path, parseInt(this.options.progress.getValue().toString(), 10), stats)
    })
    .on('change', (path, stats) => this.upload(path, parseInt(this.options.progress.getValue().toString(), 10), stats))

  private async upload(path: string, percent: number, stats?: Stats) {
    const fileName = path.replace(this.options.directory, '')
    if ((!stats || !stats.isDirectory()) && this.options.isFileAllowed(fileName)) {
      try {
        await this.lock.acquire()

        const response = await this.uploadWithRetries(path, percent, fileName)
        if (response.success) {
          await this.logger.verbose({ message: `Chunk '${fileName}' uploaded - ${(percent || 0).toFixed(2)}% done.` })
          if (!fileName.includes('dash.mpd') && !fileName.includes('init-stream')) {
            await promises.unlink(path)
          }
        } else {
          await this.logger.warning({ message: `Chunk '${fileName}' unexpected response: ${JSON.stringify(response)}` })
        }
      } catch (error) {
        await this.logger.warning({
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
    this.logger = getLogger(options.injector).withScope('ChunkUploader')
  }

  private async uploadWithRetries(path: string, percent: number, fileName: string): Promise<any> {
    let retries = 0
    let form!: FormData
    do {
      try {
        form = new FormData({ encoding: 'utf-8' })
        form.append('codec', this.options.codec)
        form.append('mode', this.options.mode)
        form.append('chunk', createReadStream(path, { autoClose: true }))
        form.append('percent', percent)
        const response = await fetch(this.options.uploadPath, {
          method: 'POST',
          body: form as any,
        })
        return await response.json()
      } catch (error) {
        if (retries >= this.options.retries) {
          await this.logger.error({
            message: 'Chunk upload has been failed, giving up...',
            data: { codec: this.options.codec, mode: this.options.mode, fileName, error },
          })
          throw error
        } else {
          await this.logger.warning({
            message: `Chunk upload has been failed, will retry (${retries}/${this.options.retries})...`,
            data: { codec: this.options.codec, mode: this.options.mode, fileName, error, retries },
          })
        }
      } finally {
        form.destroy()
      }
    } while (retries++ < this.options.retries)
    throw Error('No response')
  }
}
