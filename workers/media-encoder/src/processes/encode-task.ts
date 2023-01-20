import { join } from 'path'
import { promises } from 'fs'
import type { apis } from '@common/models'
import { media } from '@common/models'
import { FileStores } from '@common/config'
import { PathHelper } from '@furystack/utils'
import { createClient } from '@furystack/rest-client-fetch'
import type { Injector } from '@furystack/inject'
import rimraf from 'rimraf'
import { existsAsync } from '@common/service-utils'
import { getLogger } from '@furystack/logging'
import { TaskLogger } from '../services/task-logger'
import { encodeToVp9Dash } from './encode-to-vp9-dash'
import { encodeToX264Dash } from './encode-to-264-dash'

export const mediaApiPath = process.env.MEDIA_API_PATH || 'http://localhost:9093/api/media'

export const encodeTask = async (options: { task: media.EncodingTask; injector: Injector }): Promise<boolean> => {
  const callApi = createClient<apis.MediaApi>({
    endpointUrl: mediaApiPath,
  })

  const logger = getLogger(options.injector).withScope('encodeTask')
  const uploadPath = PathHelper.joinPaths(
    mediaApiPath,
    'upload-encoded',
    options.task.mediaInfo.movie._id,
    options.task.authToken,
  )

  await logger.information({
    message: `Started to work on task ${options.task._id} - Encoding ${options.task.mediaInfo.movie.metadata.title}`,
  })
  const encodingSettings = options.task.mediaInfo.library.encoding || media.defaultEncoding
  const tempDirExists = await existsAsync(FileStores.mediaEncoderWorkerTemp)
  if (!tempDirExists) {
    await logger.error({
      message: 'Media Worker temp dir does not exists or not accessible. Task skipped!',
      data: { dir: FileStores.mediaEncoderWorkerTemp },
    })
    return true
  }
  const encodingTempDir = join(
    FileStores.mediaEncoderWorkerTemp,
    'MULTIVERSE_ENCODING_TEMP',
    options.task._id as string,
  )
  const taskLogger = options.injector.getInstance(TaskLogger)

  const encodingTempDirExists = await existsAsync(encodingTempDir)

  if (encodingTempDirExists) {
    await logger.information({ message: 'The Temp dir already exists. Cleaning up...' })
    await new Promise<void>((resolve, reject) => rimraf(encodingTempDir, (err) => (err ? reject(err) : resolve())))
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
      await logger.warning({
        message: `Encoding with codec '${encodingSettings.codec}' and type '${encodingSettings.mode}' is not supported. Skipping encoding`,
      })
      return false
    }
    await callApi({
      method: 'POST',
      action: '/finialize-encoding',
      body: {
        accessToken: options.task.authToken,
        codec: encodingSettings.codec,
        mode: encodingSettings.mode,
        log: taskLogger.getAllEntries(),
      },
    })
    await new Promise<void>((resolve, reject) => rimraf(encodingTempDir, (err) => (err ? reject(err) : resolve())))
    await logger.information({ message: 'Task finished, the task has been finialized.' })
    taskLogger.flush()
    return true
  } catch (error) {
    await logger.warning({
      message: `Task encoding failed`,
      data: {
        task: options.task,
        error,
      },
    })
    callApi({
      method: 'POST',
      action: '/save-encoding-failure',
      body: {
        accessToken: options.task.authToken,
        error,
        log: taskLogger.getAllEntries(),
      },
    })
      .then(() => logger.information({ message: 'The Error details has been sent to the service' }))
      .catch(
        async (e) =>
          await logger.error({
            message:
              'There was an error during sending the error details to the service - probably the task will remain in progress',
            data: { e },
          }),
      )
    taskLogger.flush()
    return false
  }
}
