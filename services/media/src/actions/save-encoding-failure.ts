import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { media } from '@common/models'

export const SaveEncodingFailureAction: RequestAction<{
  body: { accessToken: string; error: any }
}> = async ({ injector, getBody }) => {
  const store = injector.getInstance(StoreManager).getStoreFor(media.EncodingTask)
  const { accessToken, error } = await getBody()

  const [job] = await store.find({ filter: { authToken: { $eq: accessToken } }, top: 1 })
  if (!job) {
    throw new RequestError('Unauthorized', 401)
  }

  await store.update(job._id, {
    status: 'failed',
    finishDate: new Date(),
    error,
  })

  return JsonResult({ success: true })
}
