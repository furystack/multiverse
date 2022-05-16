import { RequestError } from '@furystack/rest'
import { media } from '@common/models'
import { RequestAction, JsonResult } from '@furystack/rest-service'
import { CreateResult } from '@furystack/core'
import { getDataSetFor } from '@furystack/repository'
import { getLogger } from '@furystack/logging'
import { createEncodingTaskForMovie } from '../utils/create-encoding-task-for-movie'

export const ReEncodeAction: RequestAction<{
  body: { movieId: string }
  result: CreateResult<media.EncodingTask>
}> = async ({ getBody, injector }) => {
  const { movieId } = await getBody()
  const dataSet = getDataSetFor(injector, media.Movie, '_id')
  const movie = await dataSet.get(injector, movieId)
  if (!movie) {
    throw new RequestError('Movie not found', 404)
  }

  const tasks = getDataSetFor(injector, media.EncodingTask, '_id')

  const oldTasks = await tasks.find(injector, {
    filter: {
      $and: [
        { ['mediaInfo.movie._id']: { $eq: movieId } } as any,
        { $or: [{ status: { $eq: 'inProgress' } }, { status: { $eq: 'pending' } }] },
      ],
    },
  })
  await Promise.all(
    oldTasks.map(async (task) => {
      await tasks.update(injector, task._id, { status: 'cancelled', finishDate: new Date() })
    }),
  )

  const task = await createEncodingTaskForMovie({ movie, injector })

  getLogger(injector)
    .withScope('re-encode-action')
    .information({
      message: `Encode re-queued for movie '${movie.metadata.title}'`,
      data: {
        newTask: task,
        cancelledTasks: oldTasks,
      },
    })

  return JsonResult(task)
}
