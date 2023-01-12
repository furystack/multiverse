import type { RequestAction } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest-service'
import type { auth } from '@common/models'
import { media } from '@common/models'
import { getLogger } from '@furystack/logging'
import { getCurrentUser } from '@furystack/core'
import { getDataSetFor } from '@furystack/repository'

export const SaveWatchProgress: RequestAction<{
  body: { movieId: string; watchedSeconds: number }
  result: { success: boolean }
}> = async ({ getBody, injector }) => {
  const logger = getLogger(injector).withScope('SaveWatchProgress')

  const usr = (await getCurrentUser(injector)) as auth.User
  const { movieId, watchedSeconds } = await getBody()
  const dataSet = await getDataSetFor(injector, media.MovieWatchHistoryEntry, '_id')

  const [existing] = await dataSet.find(injector, {
    top: 1,
    order: { lastWatchDate: 'DESC', startDate: 'DESC' },
    filter: { userId: { $eq: usr._id }, movieId: { $eq: movieId } },
  })

  const movie = await getDataSetFor(injector, media.Movie, '_id').get(injector, movieId)
  if (!movie) {
    await logger.warning({ message: 'User tried to watch a movie that does not exists', data: { usr, movieId } })
  }

  if (!existing) {
    const meta = movie?.omdbMeta
    await logger.information({
      message: `User '${usr.username}' has been started to watch movie '${
        media.isValidOmdbMetadata(meta) ? meta.Title : movie?.path
      }'`,
    })
    await dataSet.add(injector, {
      movieId,
      watchedSeconds,
      userId: usr._id,
      completed: false,
      lastWatchDate: new Date(),
      startDate: new Date(),
    })
  } else {
    await dataSet.update(injector, existing._id, { watchedSeconds })
  }

  return JsonResult({ success: true })
}
