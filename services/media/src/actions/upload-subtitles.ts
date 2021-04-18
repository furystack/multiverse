import { join, extname } from 'path'
import { promises } from 'fs'
import { RequestError } from '@furystack/rest'
import { IncomingForm, Fields, Files } from 'formidable'
import { FileStores } from '@common/config'
import { media } from '@common/models'
import { StoreManager } from '@furystack/core'
import { existsAsync } from '@common/service-utils'
import { RequestAction, JsonResult } from '@furystack/rest-service'

export const UploadSubtitles: RequestAction<{
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

  const files = Object.values(parseResult.files)

  const targetPath = join(FileStores.subtitles, movie._id)
  const targetPathExists = await existsAsync(targetPath)
  if (!targetPathExists) {
    await promises.mkdir(targetPath, { recursive: true })
  }

  await Promise.all(
    files
      .filter((f) => !(f instanceof Array) && f.name && extname(f.name) === 'vtt')
      .map(async (file) => {
        if (!(file instanceof Array)) {
          await promises.copyFile(file.path, join(targetPath, file.name as string))
          // Remove from temp
          promises.unlink(file.path)
        }
      }),
  )

  return JsonResult({ success: true })
}
