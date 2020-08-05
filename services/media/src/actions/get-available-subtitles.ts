import { join, extname } from 'path'
import { promises } from 'fs'
import { RequestAction, RequestError, JsonResult } from '@furystack/rest'
import { media } from '@common/models'
import { FileStores } from '@common/config'
import { existsAsync } from '@common/service-utils'

export const GetAvailableSubtitles: RequestAction<{ urlParams: { movieId: string }; result: string[] }> = async ({
  injector,
  getUrlParams,
}) => {
  const params = getUrlParams()
  const movie = await injector.getDataSetFor(media.Movie).get(injector, params.movieId)
  if (!movie) {
    throw new RequestError('not found', 404)
  }

  const subtitlesFolder = join(FileStores.subtitles, movie._id)
  const folderExistsAsync = await existsAsync(subtitlesFolder)
  if (!folderExistsAsync) {
    return JsonResult([subtitlesFolder])
  }
  const files = await promises.readdir(subtitlesFolder)
  return JsonResult(files.filter((f) => extname(f) === 'vtt'))
}
