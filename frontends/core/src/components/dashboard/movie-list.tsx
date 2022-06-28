import { Shade, createComponent, LazyLoad } from '@furystack/shades'
import { useMediaApi } from '@common/frontend-utils'
import { Init } from '../../pages'
import { GenericErrorPage } from '../../pages/generic-error'
import { MovieWidget } from './movie-widget'

export const MovieListWidget = Shade<{
  title: string
  movieIds: string[]
  size?: number
  align?: 'center' | 'flex-start'
}>({
  shadowDomName: 'movie-list-widget',
  render: ({ injector, props }) => {
    return (
      <LazyLoad
        loader={<Init message="Loading Movies..." />}
        error={(error, retry) => <GenericErrorPage subtitle="Error loading the movies" error={error} retry={retry} />}
        component={async () => {
          const mediaApi = useMediaApi(injector)
          const { result: movies } = await mediaApi({
            method: 'GET',
            action: '/movies',
            query: {
              findOptions: {
                filter: {
                  _id: { $in: props.movieIds },
                },
              },
            },
          })

          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: props.align || 'center',
                overflow: 'hidden',
                padding: '1em',
              }}
            >
              <div style={{ overflow: 'hidden', maxWidth: '100%' }}>
                <h3>{props.title}</h3>
                <div style={{ display: 'flex', overflow: 'auto', scrollSnapType: 'x mandatory' } as any}>
                  {movies.entries.length ? (
                    movies.entries.map((movie, index) => (
                      <div style={{ scrollSnapAlign: 'start' } as any}>
                        <MovieWidget movie={movie} index={index} size={props.size || 64} />
                      </div>
                    ))
                  ) : (
                    <div>The list doesn't contains any movies</div>
                  )}
                </div>
              </div>
            </div>
          )
        }}
      />
    )
  },
})
