import { promises, createReadStream } from 'fs'
import { RequestError } from '@furystack/rest'
import { media } from '@common/models'
import { StoreManager } from '@furystack/core'
import { RequestAction, BypassResult } from '@furystack/rest-service'
import { getDataSetFor } from '@furystack/repository'

export const StreamOriginalAction: RequestAction<{
  url: { movieId: string; accessToken?: string }
  result: unknown
}> = async ({ request, response, getUrlParams, injector }) => {
  const { movieId, accessToken } = getUrlParams()
  let movie: media.Movie | undefined

  if (accessToken) {
    const [job] = await getDataSetFor(injector, media.EncodingTask, '_id').find(injector, {
      filter: { authToken: { $eq: accessToken }, status: { $ne: 'finished' } },
      top: 1,
    })
    if (!job) {
      throw new RequestError('Unauthorized', 401)
    }
    // elevated load with token
    movie = await injector.getInstance(StoreManager).getStoreFor(media.Movie, '_id').get(movieId)
  } else {
    // normal load with user ctx
    movie = await getDataSetFor(injector, media.Movie, '_id').get(injector, movieId)
  }

  if (!movie) {
    throw new RequestError('Movie not found', 404)
  }

  const stat = await promises.stat(movie.path)
  const fileSize = stat.size
  const { range } = request.headers
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunksize = end - start + 1
    const file = createReadStream(movie.path, { start, end, autoClose: true })
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    response.writeHead(206, head)
    file.pipe(response)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    response.writeHead(200, head)
    createReadStream(movie.path, { autoClose: true }).pipe(response)
  }
  return BypassResult()
}
