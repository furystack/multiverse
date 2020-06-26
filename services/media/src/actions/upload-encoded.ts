import { join } from 'path'
import { promises, existsSync } from 'fs'
import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { IncomingForm, Fields, Files } from 'formidable'
import { FileStores } from '@common/config'
import { media } from '@common/models'
import { StoreManager } from '@furystack/core'

export const UploadEncoded: RequestAction<{ urlParams: { movieId: string; accessToken: string } }> = async ({
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

  const parseResult = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) =>
    form.parse(request, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      resolve({ fields, files })
    }),
  )
  const { codec, mode } = parseResult.fields

  const file = parseResult.files.chunk
  if (file) {
    const targetPath = join(FileStores.encodedMedia, codec as string, mode as string, movie._id)
    if (!existsSync(targetPath)) {
      await promises.mkdir(targetPath, { recursive: true })
    }

    await promises.copyFile(file.path, join(targetPath, file.name))
    // Remove from temp
    promises.unlink(file.path)
  }

  const { percent, error } = parseResult.fields

  if (percent) {
    const percentNo = parseInt(percent as string, 10)
    await await injector.getDataSetFor(media.EncodingTask).update(injector, job._id, {
      percent: percentNo,
      error,
      status: error ? 'failed' : percentNo === 100 ? 'finished' : 'inProgress',
      finishDate: percentNo === 100 ? new Date() : undefined,
      workerInfo: {
        ip: (request.headers['x-forwarded-for'] as string) || request.connection.remoteAddress || 'unknown',
      },
    })
    if (percentNo === 100 && !file) {
      await storeManager.getStoreFor(media.Movie).update(movieId, {
        availableFormats: [
          ...(movie.availableFormats || []).filter((f) => !(f.codec === codec && f.mode === mode)),
          { codec: codec as any, mode: mode as any },
        ],
      })
    }
  }

  return JsonResult({ success: true })
}
