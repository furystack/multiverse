import { createReadStream } from 'fs'
import { join } from 'path'
import { RequestAction, RequestError, BypassResult } from '@furystack/rest'
import { media } from '@common/models'
import { FileStores } from '@common/config'
import { existsAsync } from '@common/service-utils'

export const WatchStream: RequestAction<{
  urlParams: { id: string; codec: media.EncodingType['codec']; mode: media.EncodingType['mode']; chunk?: string }
}> = async ({ getUrlParams, injector, response }) => {
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
  const head = {}
  response.writeHead(200, head)
  createReadStream(filePath).pipe(response)
  return BypassResult()
}
