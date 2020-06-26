import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { media } from '@common/models'
import { createEncodingTaskForMovie } from '../utils/create-encoding-task-for-movie'

export const ReEncodeAction: RequestAction<{ body: { movieId: string } }> = async ({ getBody, injector }) => {
  const { movieId } = await getBody()
  const dataSet = injector.getDataSetFor(media.Movie)
  const movie = await dataSet.get(injector, movieId)
  if (!movie) {
    throw new RequestError('Movie not found', 404)
  }
  const oldTasks = await injector.getDataSetFor(media.EncodingTask).find(injector, {
    filter: {
      $and: [
        { ['mediaInfo.movie._id']: { $eq: movieId } } as any,
        { $or: [{ status: { $eq: 'inProgress' } }, { status: { $eq: 'pending' } }] },
      ],
    },
  })
  await Promise.all(
    oldTasks.map(async (task) => {
      await injector.getDataSetFor(media.EncodingTask).update(injector, task._id, { status: 'cancelled' })
    }),
  )

  const task = await createEncodingTaskForMovie({ movie, injector })

  injector.logger.withScope('re-encode-action').information({
    message: `Encode re-queued for movie '${movie.metadata.title}'`,
    data: {
      newTask: task,
      cancelledTasks: oldTasks,
    },
  })

  return JsonResult({ success: task ? true : false, task })
}
