import { join } from 'path'
import { existsSync, promises } from 'fs'
import { media } from '@common/models'
import { sites, FileStores } from '@common/config'
import { PathHelper } from '@furystack/utils'
import { Injector } from '@furystack/inject'
import rimraf from 'rimraf'
import { encodeToDash } from './encode-to-dash'

export const encodeTask = async (options: { task: media.EncodingTask; injector: Injector }) => {
  const logger = options.injector.logger.withScope('dashEncoder')
  const uploadPath = PathHelper.joinPaths(
    sites.services.media.externalPath,
    'media',
    'upload-encoded',
    options.task.mediaInfo.movie._id,
    options.task.authToken,
  )

  logger.information({
    message: `Started to work on task ${options.task._id} - Encoding ${options.task.mediaInfo.movie.metadata.title}`,
  })
  const encodingSettings = options.task.mediaInfo.library.encoding || media.defaultEncoding
  if (!existsSync(FileStores.mediaEncoderWorkerTemp)) {
    logger.error({
      message: 'Media Worker temp dir does not exists or not accessible. Task skipped!',
      data: { dir: FileStores.mediaEncoderWorkerTemp },
    })
    return
  }
  const encodingTempDir = join(FileStores.mediaEncoderWorkerTemp, 'MULTIVERSE_ENCODING_TEMP', options.task._id)

  if (existsSync(encodingTempDir)) {
    logger.information({ message: 'The Temp dir already exists. Cleaning up...' })
    await new Promise((resolve, reject) => rimraf(encodingTempDir, (err) => (err ? reject(err) : resolve())))
    // await promises.unlink(encodingTempDir)
  }
  await promises.mkdir(encodingTempDir, { recursive: true })

  const source = PathHelper.joinPaths(
    sites.services.media.externalPath,
    `/media/stream-original/${options.task.mediaInfo.movie._id}/${options.task.authToken}`,
  )

  if (encodingSettings.mode === 'dash') {
    await encodeToDash({
      injector: options.injector,
      cwd: encodingTempDir,
      source,
      task: options.task,
      uploadPath,
    })
  } else {
    logger.warning({ message: `Encoding type '${encodingSettings.mode}' is not supported. Skipping encoding` })
  }
}
