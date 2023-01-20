import { useMediaApi } from '@common/frontend-utils'
import type { media } from '@common/models'
import { createComponent } from '@furystack/shades'
import type { CommandProvider } from '@furystack/shades-common-components'
import { MovieWidget } from '../../components/dashboard/movie-widget'

export const continueMovieProvider: CommandProvider = async ({ injector, term }) => {
  if (term.toLowerCase().startsWith('cont') || term.toLowerCase().includes('movie')) {
    const mediaApi = useMediaApi(injector)
    const { result: progress } = await mediaApi({
      method: 'GET',
      action: '/my-watch-progress',
      query: {
        findOptions: {
          order: { lastWatchDate: 'DESC', startDate: 'DESC' },
          filter: { completed: { $eq: false } },
          top: 5,
        },
      },
    })
    if (!progress.entries.length) {
      return []
    }
    const { result: movies } = await mediaApi({
      method: 'GET',
      action: '/movies',
      query: { findOptions: { filter: { _id: { $in: progress.entries.map((e) => e.movieId) } } } },
    })

    if (!movies.count) {
      return []
    }
    return [
      {
        onSelected: () => {
          /** */
        },
        score: 100,
        element: (
          <div>
            <h3>Continue Watching</h3>
            <div style={{ display: 'flex', overflow: 'auto' }}>
              {movies.entries.map((movie, index) => (
                <MovieWidget movie={movie as media.Movie} size={192} index={index} />
              ))}
            </div>
          </div>
        ),
      },
    ]
  }
  return []
}
