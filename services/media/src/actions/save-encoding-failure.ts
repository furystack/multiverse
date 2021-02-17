import { RequestError } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { media } from '@common/models'
import { LeveledLogEntry } from '@furystack/logging'
import { RequestAction, JsonResult } from '@furystack/rest-service'

export const SaveEncodingFailureAction: RequestAction<{
  body: { accessToken: string; error: any; log: Array<LeveledLogEntry<any>> }
  result: { success: boolean }
}> = async ({ injector, getBody }) => {
  const store = injector.getInstance(StoreManager).getStoreFor(media.EncodingTask)
  const { accessToken, error, log } = await getBody()

  const [job] = await store.find({ filter: { authToken: { $eq: accessToken } }, top: 1 })
  if (!job) {
    throw new RequestError('Unauthorized', 401)
  }

  await store.update(job._id, {
    status: 'failed',
    finishDate: new Date(),
    authToken: '',
    log,
    error,
  })

  return JsonResult({ success: true })
}
