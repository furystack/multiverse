import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { media } from '@common/models'

export const FinializeEncodingAction: RequestAction<{
  body: { accessToken: string; codec: media.EncodingType['codec']; mode: media.EncodingType['mode'] }
}> = async ({ injector, getBody }) => {
  const { accessToken, codec, mode } = await getBody()
  const storeManager = injector.getInstance(StoreManager)

  const [job] = await storeManager
    .getStoreFor(media.EncodingTask)
    .find({ filter: { authToken: { $eq: accessToken } }, top: 1 })
  if (!job) {
    throw new RequestError('Unauthorized', 401)
  }

  const { movie } = job.mediaInfo

  await injector.getDataSetFor(media.Movie).update(injector, movie._id, {
    availableFormats: [
      ...(movie.availableFormats || []).filter((f) => !(f.codec === codec && f.mode === mode)),
      { codec, mode },
    ],
  })

  await injector
    .getDataSetFor(media.EncodingTask)
    .update(injector, job._id, { status: 'finished', finishDate: new Date(), percent: 100 })

  return JsonResult({ success: true })
}
