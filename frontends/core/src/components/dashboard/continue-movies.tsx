import { Shade, createComponent, LazyLoad } from '@furystack/shades'
import { MediaApiService } from '@common/frontend-utils'
import { media } from '@common/models'
import { Init } from '../../pages'
import { GenericErrorPage } from '../../pages/generic-error'
import { MovieWidget } from './movie-widget'

export const ContinueMoviesWidget = Shade<{ count: number }>({
  shadowDomName: 'multiverse-continue-watching',
  render: ({ injector, props }) => {
    const nothingToShow = <div>You don't have movies in progress.</div>
    return (
      <LazyLoad
        loader={<Init message="Loading Movie History..." />}
        error={(error, retry) => (
          <GenericErrorPage subtitle="Error loading your Movie History" error={error} retry={retry} />
        )}
        component={async () => {
          const mediaApi = injector.getInstance(MediaApiService)
          const { result: progress } = await mediaApi.call({
            method: 'GET',
            action: '/my-watch-progress',
            query: {
              findOptions: {
                order: { lastWatchDate: 'DESC', startDate: 'DESC' },
                filter: { completed: { $eq: false } },
                top: props.count,
              },
            },
          })

          if (!progress.entries.length) {
            return nothingToShow
          }

          const { result: movies } = await mediaApi.call({
            method: 'GET',
            action: '/movies',
            query: { findOptions: { filter: { _id: { $in: progress.entries.map((e) => e.movieId) } } } },
          })

          if (!movies.entries.length) {
            return nothingToShow
          }

          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflow: 'hidden',
                padding: '1em',
              }}
            >
              <div style={{ overflow: 'hidden', maxWidth: '100%' }}>
                <h3>Continue watching</h3>
                <div style={{ display: 'flex', overflow: 'auto', scrollSnapType: 'x mandatory' } as any}>
                  {movies.entries.map((movie, index) => (
                    <div style={{ scrollSnapAlign: 'start' } as any}>
                      <MovieWidget
                        size={256}
                        movie={movie as media.Movie}
                        index={index}
                        watchHistory={
                          progress.entries.find((e) => e.movieId === movie._id) as media.MovieWatchHistoryEntry
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }}
      />
    )
  },
})
