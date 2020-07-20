import { PathHelper } from '@furystack/utils'
import { media } from '@common/models'
import got from 'got'

import { mediaApiPath } from './encode-task'

export const loadTaskDetails = async ({ taskId, token }: { taskId: string; token: string }) => {
  const { body } = await got(PathHelper.joinPaths(mediaApiPath, 'encode', 'get-worker-task', taskId), {
    headers: {
      'task-token': token,
    },
  })
  const task: media.EncodingTask = JSON.parse(body)
  return task
}
