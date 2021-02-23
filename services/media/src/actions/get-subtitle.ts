import { createReadStream } from 'fs'
import { join } from 'path'
import { RequestError } from '@furystack/rest'
import { media } from '@common/models'
import { FileStores } from '@common/config'
import { existsAsync } from '@common/service-utils'
import { RequestAction, BypassResult } from '@furystack/rest-service'

export const GetSubtitle: RequestAction<{ url: { movieId: string; subtitleName: string }; result: unknown }> = async ({
  getUrlParams,
  injector,
  response,
}) => {
  const params = getUrlParams()
  const movie = await injector.getDataSetFor(media.Movie).get(injector, params.movieId)
  if (!movie) {
    throw new RequestError('not found', 404)
  }

  const filePath = join(FileStores.subtitles, movie._id, params.subtitleName)
  const fileExists = await existsAsync(filePath)
  if (!fileExists) {
    throw new RequestError('Media not found', 404)
  }
  const head = {}
  response.writeHead(200, head)
  createReadStream(filePath).pipe(response)
  return BypassResult()
}
