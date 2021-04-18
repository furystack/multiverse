import { RequestAction, JsonResult } from '@furystack/rest-service'
import { auth, media } from '@common/models'
import { isValidOmdbMetadata } from '@common/models/dist/media'

export const SaveWatchProgress: RequestAction<{
  body: { movieId: string; watchedSeconds: number }
  result: { success: boolean }
}> = async ({ getBody, injector }) => {
  const logger = injector.logger.withScope('SaveWatchProgress')

  const usr = await injector.getCurrentUser<auth.User>()
  const { movieId, watchedSeconds } = await getBody()
  const dataSet = await injector.getDataSetFor(media.MovieWatchHistoryEntry, '_id')

  const [existing] = await dataSet.find(injector, {
    top: 1,
    order: { lastWatchDate: 'DESC', startDate: 'DESC' },
    filter: { userId: { $eq: usr._id }, movieId: { $eq: movieId } },
  })

  const movie = await injector.getDataSetFor(media.Movie, '_id').get(injector, movieId)
  if (!movie) {
    logger.warning({ message: 'User tried to watch a movie that does not exists', data: { usr, movieId } })
  }

  if (!existing) {
    const meta = movie?.omdbMeta
    logger.information({
      message: `User '${usr.username}' has been started to watch movie '${
        isValidOmdbMetadata(meta) ? meta.Title : movie?.path
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
