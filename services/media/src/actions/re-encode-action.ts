import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { media } from '@common/models'
import { createEncodingTaskForMovie } from '../utils/create-encoding-task-for-movie'

export const ReEncodeAction: RequestAction<{ urlParams: { movieId: string } }> = async ({ getUrlParams, injector }) => {
  const { movieId } = getUrlParams()
  const dataSet = injector.getDataSetFor(media.Movie)
  const movie = await dataSet.get(injector, movieId)
  if (!movie) {
    throw new RequestError('Movie not found', 404)
  }
  const task = await createEncodingTaskForMovie({ movie, injector })
  return JsonResult({ success: task ? true : false, task })
}
