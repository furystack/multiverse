import { PathHelper } from '@furystack/utils'
import { sites } from '@common/config'
import { media } from '@common/models'
import got from 'got'

export const loadTaskDetails = async ({ taskId, token }: { taskId: string; token: string }) => {
  const { body } = await got(
    PathHelper.joinPaths(sites.services.media.externalPath, 'media', 'encode', 'get-worker-task', taskId),
    {
      headers: {
        'task-token': token,
      },
    },
  )
  const task: media.EncodingTask = JSON.parse(body)
  return task
}
