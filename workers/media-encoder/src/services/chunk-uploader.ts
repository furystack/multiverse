import { Stats, createReadStream } from 'fs'
import { watch, FSWatcher } from 'chokidar'
import { Injector } from '@furystack/inject'
import { ScopedLogger } from '@furystack/logging'
import { Retrier, PathHelper } from '@furystack/utils'
import Semaphore from 'semaphore-async-await'
import { sites } from '@common/config'
import got from 'got'
import { media } from '@common/models'
import FormData from 'form-data'

export interface ChunkWatcherOptions {
  directory: string
  parallel: number
  isFileAllowed: (filename: string) => boolean
  task: media.EncodingTask
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
        // await sleepAsync(1000)
        const uploadPath = PathHelper.joinPaths(
          sites.services.media.externalPath,
          'media',
          'upload-encoded',
          this.options.task.mediaInfo.movie._id,
          this.options.task.authToken,
        )
        const form = new FormData({ encoding: 'utf-8' })
        form.append('chunk', createReadStream(path) as any)
        await got(uploadPath, {
          method: 'POST',
          body: form as any,
          encoding: 'utf-8',
          retry: { limit: 10, statusCodes: [500] },
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

  constructor(injector: Injector, private readonly options: ChunkWatcherOptions) {
    this.logger = injector.logger.withScope('ChunkUploader')
  }
}
