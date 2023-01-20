import { RequestError } from '@furystack/rest'
import { media } from '@common/models'
import type { RequestAction } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest-service'
import { getDataSetFor } from '@furystack/repository'

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
  const task = await getDataSetFor(injector, media.EncodingTask, '_id').get(injector, taskId)

  if (task?.authToken !== token) {
    throw new RequestError('Failed to authorize with the token', 401)
  }

  if (!task) {
    throw new RequestError('Task not found', 404)
  }

  return JsonResult(task)
}
