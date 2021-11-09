import { join } from 'path'
import { promises } from 'fs'
import { RequestError } from '@furystack/rest'
import { IncomingForm, Fields, Files } from 'formidable'
import { FileStores } from '@common/config'
import { media } from '@common/models'
import { StoreManager } from '@furystack/core'
import { existsAsync } from '@common/service-utils'
import { RequestAction, JsonResult } from '@furystack/rest-service'
import { assertIsValidFolderName } from '../utils/assert-is-valid-foldername'

export const UploadEncoded: RequestAction<{
  url: { movieId: string; accessToken: string }
  result: { success: boolean }
}> = async ({ injector, request, getUrlParams }) => {
  const { movieId, accessToken } = getUrlParams()

  const storeManager = injector.getInstance(StoreManager)

  const [job] = await storeManager
    .getStoreFor(media.EncodingTask, '_id')
    .find({ filter: { authToken: { $eq: accessToken } }, top: 1 })
  if (!job) {
    throw new RequestError('Unauthorized', 401)
  }

  const movie = (await storeManager.getStoreFor(media.Movie, '_id').get(movieId)) as media.Movie
  if (!movie) {
    throw new RequestError('Movie not found', 404)
  }

  const form = new IncomingForm({
    uploadDir: FileStores.tempdir,
  })

  const parseResult = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) =>
    form.parse(request, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      resolve({ fields, files })
    }),
  )
  const { codec, mode } = parseResult.fields

  assertIsValidFolderName(codec)
  assertIsValidFolderName(mode)

  const file = parseResult.files.chunk
  if (file instanceof Array) {
    throw new RequestError('Multiple files are not supported', 400)
  }
  if (file) {
    const targetPath = join(FileStores.encodedMedia, codec as string, mode as string, movie._id)
    const targetPathExists = await existsAsync(targetPath)
    if (!targetPathExists) {
      await promises.mkdir(targetPath, { recursive: true })
    }

    await promises.copyFile(file.filepath, join(targetPath, file.originalFilename as string))
    // Remove from temp
    await promises.unlink(file.filepath)
  }

  const { percent, error } = parseResult.fields

  if (percent) {
    const percentNo = parseFloat(percent as string)
    await await injector.getDataSetFor(media.EncodingTask, '_id').update(injector, job._id, {
      ...(!job.startDate ? { startDate: new Date() } : {}),
      percent: percentNo,
      error,
      status: error ? 'failed' : 'inProgress',
      workerInfo: {
        ip: (request.headers['x-forwarded-for'] as string) || request.socket.remoteAddress || 'unknown',
      },
    })
  }

  return JsonResult({ success: true })
}
