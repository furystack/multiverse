import { existsSync, createReadStream } from 'fs'
import { join } from 'path'
import { RequestAction, RequestError, BypassResult } from '@furystack/rest'
import { media } from '@common/models'
import { FileStores } from '@common/config'

export const WatchDash: RequestAction<{ urlParams: { id: string; chunk?: string } }> = async ({
  getUrlParams,
  injector,
  response,
}) => {
  const params = getUrlParams()
  const chunk = params.chunk || 'dash.mpd'
  const movie = await injector.getDataSetFor(media.Movie).get(injector, params.id, ['path'])
  if (!movie) {
    throw new RequestError('not found', 404)
  }

  const filePath = join(FileStores.encodedMedia, movie._id, chunk)
  if (!existsSync(filePath)) {
    throw new RequestError('Media not found', 404)
  }
  const head = {}
  response.writeHead(200, head)
  createReadStream(filePath).pipe(response)
  return BypassResult()
}
