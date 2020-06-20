import { join } from 'path'
import { promises, existsSync } from 'fs'
import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { IncomingForm, Fields, Files } from 'formidable'
import { FileStores } from '@common/config'
import { media } from '@common/models'

export const UploadEncoded: RequestAction<{ urlParams: { movieId: string; accessToken: string } }> = async ({
  injector,
  request,
  getUrlParams,
}) => {
  const { movieId, accessToken } = getUrlParams()

  const [job] = await injector
    .getDataSetFor(media.EncodingTask)
    .find(injector, { filter: { authToken: { $eq: accessToken } }, top: 1 })
  if (!job) {
    throw new RequestError('Unauthorized', 401)
  }

  const movie = await injector.getDataSetFor(media.Movie).get(injector, movieId)
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

  const file = parseResult.files.chunk
  if (file) {
    const targetPath = join(FileStores.encodedMedia, movie._id)
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
      workerInfo: {
        ip: request.connection.remoteAddress || 'unknown',
      },
    })
  }

  return JsonResult({ success: true })
}
