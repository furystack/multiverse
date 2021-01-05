import { join, extname } from 'path'
import { promises } from 'fs'
import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { IncomingForm, Fields, Files } from 'formidable'
import { FileStores } from '@common/config'
import { media } from '@common/models'
import { StoreManager } from '@furystack/core'
import { existsAsync } from '@common/service-utils'

export const UploadSubtitles: RequestAction<{ urlParams: { movieId: string; accessToken: string } }> = async ({
  injector,
  request,
  getUrlParams,
}) => {
  const { movieId, accessToken } = getUrlParams()

  const storeManager = injector.getInstance(StoreManager)

  const [job] = await storeManager
    .getStoreFor(media.EncodingTask)
    .find({ filter: { authToken: { $eq: accessToken } }, top: 1 })
  if (!job) {
    throw new RequestError('Unauthorized', 401)
  }

  const movie = (await storeManager.getStoreFor(media.Movie).get(movieId)) as media.Movie
  if (!movie) {
    throw new RequestError('Movie not found', 404)
  }

  const form = new IncomingForm()
  form.uploadDir = FileStores.tempdir

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
      .filter((f) => !(f instanceof Array) && extname(f.name) === 'vtt')
      .map(async (file) => {
        if (!(file instanceof Array)) {
          await promises.copyFile(file.path, join(targetPath, file.name))
          // Remove from temp
          promises.unlink(file.path)
        }
      }),
  )

  return JsonResult({ success: true })
}
