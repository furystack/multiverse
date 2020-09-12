import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { media } from '@common/models'
import { LeveledLogEntry } from '@furystack/logging'

export const FinializeEncodingAction: RequestAction<{
  body: {
    accessToken: string
    codec: media.EncodingType['codec']
    mode: media.EncodingType['mode']
    log: Array<LeveledLogEntry<any>>
  }
}> = async ({ injector, getBody }) => {
  const { accessToken, codec, mode, log } = await getBody()

  const tasks = injector.getDataSetFor(media.EncodingTask)

  const [job] = await tasks.find(injector, { filter: { authToken: { $eq: accessToken } }, top: 1 })
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
    .update(injector, job._id, { status: 'finished', finishDate: new Date(), percent: 100, authToken: '', log })

  return JsonResult({ success: true })
}
