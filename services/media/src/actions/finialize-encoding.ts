import { RequestError } from '@furystack/rest'
import { media } from '@common/models'
import { LeveledLogEntry } from '@furystack/logging'
import { RequestAction, JsonResult } from '@furystack/rest-service'
import { getDataSetFor } from '@furystack/repository'

export const FinializeEncodingAction: RequestAction<{
  body: {
    accessToken: string
    codec: media.EncodingType['codec']
    mode: media.EncodingType['mode']
    log: Array<LeveledLogEntry<any>>
  }
  result: {
    success: boolean
  }
}> = async ({ injector, getBody }) => {
  const { accessToken, codec, mode, log } = await getBody()

  const tasks = getDataSetFor(injector, media.EncodingTask, '_id')

  const [job] = await tasks.find(injector, { filter: { authToken: { $eq: accessToken } }, top: 1 })
  if (!job) {
    throw new RequestError('Unauthorized', 401)
  }

  const { movie } = job.mediaInfo

  await getDataSetFor(injector, media.Movie, '_id').update(injector, movie._id, {
    availableFormats: [
      ...(movie.availableFormats || []).filter((f) => !(f.codec === codec && f.mode === mode)),
      { codec, mode },
    ],
  })

  await getDataSetFor(injector, media.EncodingTask, '_id').update(injector, job._id, {
    status: 'finished',
    finishDate: new Date(),
    percent: 100,
    authToken: '',
    log,
  })

  return JsonResult({ success: true })
}
