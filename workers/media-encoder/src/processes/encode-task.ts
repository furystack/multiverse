import { join } from 'path'
import { promises } from 'fs'
import { media } from '@common/models'
import { FileStores } from '@common/config'
import { PathHelper } from '@furystack/utils'
import { Injector } from '@furystack/inject'
import got from 'got'
import rimraf from 'rimraf'
import { existsAsync } from '@common/service-utils'
import { TaskLogger } from '../services/task-logger'
import { encodeToVp9Dash } from './encode-to-vp9-dash'
import { encodeToX264Dash } from './encode-to-264-dash'

export const mediaApiPath = process.env.MEDIA_API_PATH || 'http://localhost:9093/api/media'

export const encodeTask = async (options: { task: media.EncodingTask; injector: Injector }): Promise<boolean> => {
  const logger = options.injector.logger.withScope('encodeTask')
  const uploadPath = PathHelper.joinPaths(
    mediaApiPath,
    'upload-encoded',
    options.task.mediaInfo.movie._id,
    options.task.authToken,
  )

  logger.information({
    message: `Started to work on task ${options.task._id} - Encoding ${options.task.mediaInfo.movie.metadata.title}`,
  })
  const encodingSettings = options.task.mediaInfo.library.encoding || media.defaultEncoding
  const tempDirExists = await existsAsync(FileStores.mediaEncoderWorkerTemp)
  if (!tempDirExists) {
    logger.error({
      message: 'Media Worker temp dir does not exists or not accessible. Task skipped!',
      data: { dir: FileStores.mediaEncoderWorkerTemp },
    })
    return true
  }
  const encodingTempDir = join(FileStores.mediaEncoderWorkerTemp, 'MULTIVERSE_ENCODING_TEMP', options.task._id)
  const taskLogger = options.injector.getInstance(TaskLogger)

  const encodingTempDirExists = await existsAsync(encodingTempDir)

  if (encodingTempDirExists) {
    logger.information({ message: 'The Temp dir already exists. Cleaning up...' })
    await new Promise((resolve, reject) => rimraf(encodingTempDir, (err) => (err ? reject(err) : resolve())))
  }
  await promises.mkdir(encodingTempDir, { recursive: true })

  const source = PathHelper.joinPaths(
    mediaApiPath,
    `/stream-original/${options.task.mediaInfo.movie._id}/${options.task.authToken}`,
  )

  try {
    if (encodingSettings.codec === 'libvpx-vp9' && encodingSettings.mode === 'dash') {
      await encodeToVp9Dash({
        injector: options.injector,
        cwd: encodingTempDir,
        source,
        task: options.task,
        uploadPath,
        encodingSettings,
      })
      return true
    } else if (encodingSettings.codec === 'x264' && encodingSettings.mode === 'dash') {
      await encodeToX264Dash({
        injector: options.injector,
        cwd: encodingTempDir,
        source,
        task: options.task,
        uploadPath,
        encodingSettings,
      })
    } else {
      logger.warning({
        message: `Encoding with codec '${encodingSettings.codec}' and type '${encodingSettings.mode}' is not supported. Skipping encoding`,
      })
      return false
    }
    await got(PathHelper.joinPaths(mediaApiPath, 'finialize-encoding'), {
      method: 'POST',
      body: JSON.stringify({
        accessToken: options.task.authToken,
        codec: encodingSettings.codec,
        mode: encodingSettings.mode,
        log: taskLogger.getAllEntries(),
      }),
      encoding: 'utf-8',
      retry: 10,
    })
    logger.information({ message: 'Task finished, the task has been finialized.' })
    taskLogger.flush()
    return true
  } catch (error) {
    logger.warning({
      message: `Task encoding failed`,
      data: {
        task: options.task,
        error: {
          message: error.message,
          stack: error.stack,
        },
      },
    })
    got(PathHelper.joinPaths(mediaApiPath, 'save-encoding-failure'), {
      method: 'POST',
      body: JSON.stringify({
        accessToken: options.task.authToken,
        error: {
          message: error.message,
          stack: error.stack,
          stdout: error.stdout,
          stderr: error.stderr,
          originalError: error,
          log: taskLogger.getAllEntries(),
        },
      }),
      encoding: 'utf-8',
      retry: 10,
    })
      .then(() => logger.information({ message: 'The Error details has been sent to the service' }))
      .catch((e) =>
        logger.error({
          message:
            'There was an error during sending the error details to the service - probably the task will remain in progress',
          data: { e },
        }),
      )
    taskLogger.flush()
    return false
  }
}
