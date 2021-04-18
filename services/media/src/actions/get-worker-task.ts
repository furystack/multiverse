import { RequestError } from '@furystack/rest'
import { media } from '@common/models'
import { RequestAction, JsonResult } from '@furystack/rest-service'

export const GetWorkerTask: RequestAction<{
  result: media.EncodingTask
  url: { taskId: string }
  headers: { 'task-token': string }
}> = async ({ injector, getUrlParams, headers }) => {
  const token = headers['task-token']

  if (!token || typeof token !== 'string') {
    throw new RequestError('Missing or bad token', 400)
  }

  const { taskId } = getUrlParams()
  const task = await injector.getDataSetFor(media.EncodingTask, '_id').get(injector, taskId)

  if (task?.authToken !== token) {
    throw new RequestError('Failed to authorize with the token', 401)
  }

  if (!task) {
    throw new RequestError('Task not found', 404)
  }

  return JsonResult(task)
}
