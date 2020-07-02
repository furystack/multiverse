import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { media } from '@common/models'

export const GetWorkerTask: RequestAction<{
  result: media.EncodingTask
  urlParams: { taskId: string }
}> = async ({ injector, request, getUrlParams }) => {
  const token = request.headers?.['task-token']

  if (!token || typeof token !== 'string') {
    throw new RequestError('Missing or bad token', 400)
  }

  const { taskId } = getUrlParams()
  const task = await injector.getDataSetFor(media.EncodingTask).get(injector, taskId)

  if (task?.authToken !== token) {
    throw new RequestError('Failed to authorize with the token', 401)
  }

  if (!task) {
    throw new RequestError('Task not found', 404)
  }

  return JsonResult(task)
}
