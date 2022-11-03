import { apis, media } from '@common/models'
import { createClient } from '@furystack/rest-client-fetch'
import { mediaApiPath } from './encode-task'

export const loadTaskDetails = async ({ taskId, token }: { taskId: string; token: string }) => {
  const callApi = createClient<apis.MediaApi>({
    endpointUrl: mediaApiPath,
  })
  const body = await callApi({
    method: 'GET',
    action: '/encode/get-worker-task/:taskId',
    url: {
      taskId,
    },
    headers: {
      'task-token': token,
    },
  })
  const task: media.EncodingTask = body.result
  return task
}
