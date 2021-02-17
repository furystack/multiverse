import { promises, createReadStream } from 'fs'
import { RequestError } from '@furystack/rest'
import { media } from '@common/models'
import { StoreManager, PartialResult } from '@furystack/core'
import { RequestAction, BypassResult } from '@furystack/rest-service'

export const StreamOriginalAction: RequestAction<{
  url: { movieId: string; accessToken?: string }
  result: unknown
}> = async ({ request, response, getUrlParams, injector }) => {
  const { movieId, accessToken } = getUrlParams()
  let movie: PartialResult<media.Movie, 'path'> | undefined

  if (accessToken) {
    const [job] = await injector
      .getDataSetFor(media.EncodingTask)
      .find(injector, { filter: { authToken: { $eq: accessToken }, status: { $ne: 'finished' } }, top: 1 })
    if (!job) {
      throw new RequestError('Unauthorized', 401)
    }
    // elevated load with token
    movie = await injector.getInstance(StoreManager).getStoreFor(media.Movie).get(movieId)
  } else {
    // normal load with user ctx
    movie = await injector.getDataSetFor(media.Movie).get(injector, movieId)
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
    const file = createReadStream(movie.path, { start, end })
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
    createReadStream(movie.path).pipe(response)
  }
  return BypassResult()
}
