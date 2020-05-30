import { promises, createReadStream } from 'fs'
import { RequestAction, BypassResult, RequestError } from '@furystack/rest'
import { media } from '@common/models'

export const WatchAction: RequestAction<{ urlParams: { id: string } }> = async ({
  request,
  response,
  getUrlParams,
  injector,
}) => {
  const { id } = getUrlParams()
  const movie = await injector.getDataSetFor(media.Movie).get(injector, id, ['path'])
  if (!movie) {
    throw new RequestError('not found', 404)
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
