import { createReadStream, promises } from 'fs'
import { join } from 'path'
import { RequestAction, RequestError, BypassResult } from '@furystack/rest'
import { media } from '@common/models'
import { FileStores } from '@common/config'
import { existsAsync } from '@common/service-utils'

export const WatchStream: RequestAction<{
  urlParams: { id: string; codec: media.EncodingType['codec']; mode: media.EncodingType['mode']; chunk?: string }
}> = async ({ getUrlParams, injector, request, response }) => {
  const params = getUrlParams()
  const chunk = params.chunk || 'dash.mpd'
  const movie = await injector.getDataSetFor(media.Movie).get(injector, params.id)
  if (!movie) {
    throw new RequestError('not found', 404)
  }

  const filePath = join(FileStores.encodedMedia, params.codec, params.mode, movie._id, chunk)
  const fileExists = await existsAsync(filePath)
  if (!fileExists) {
    throw new RequestError('Media not found', 404)
  }

  const stat = await promises.stat(filePath)
  const fileSize = stat.size

  const contentType = params.codec === 'x264' ? 'video/H264' : params.codec === 'libvpx-vp9' ? 'video/webm' : 'video'

  const { range } = request.headers
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunksize = end - start + 1
    const file = createReadStream(filePath, { start, end })
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    }

    response.writeHead(206, head)
    file.pipe(response)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    }
    response.writeHead(200, head)
    createReadStream(filePath).pipe(response)
  }

  return BypassResult()
}
