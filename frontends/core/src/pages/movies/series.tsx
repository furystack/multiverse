import { media } from '@common/models'
import { createComponent, Screen, Shade } from '@furystack/shades'
import { promisifyAnimation } from '@furystack/shades-common-components'

export interface SeriesListProps {
  series: media.Series
  movies: media.Movie[]
}

export const Series = Shade<SeriesListProps, { isDesktop: boolean }>({
  getInitialState: ({ injector }) => ({
    isDesktop: injector.getInstance(Screen).screenSize.atLeast.md.getValue(),
  }),
  constructed: ({ injector, updateState, element }) => {
    promisifyAnimation(
      element.querySelector('img'),
      [
        { opacity: 0, transform: 'scale(0.85)' },
        { opacity: 1, transform: 'scale(1)' },
      ],
      {
        easing: 'cubic-bezier(0.415, 0.225, 0.375, 1.355)',
        duration: 500,
        direction: 'alternate',
        fill: 'forwards',
      },
    )
    const subscribers = [
      injector.getInstance(Screen).screenSize.atLeast.md.subscribe((isDesktop) => updateState({ isDesktop })),
    ]
    return () => subscribers.forEach((sub) => sub.dispose())
  },
  render: ({ props, getState }) => {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}>
          <div style={{ padding: '2em' }}>
            <img
              src={props.series.omdbMetadata.Poster}
              alt={`thumbnail for ${props.series.omdbMetadata.Title}`}
              style={{ boxShadow: '3px 3px 8px rgba(0,0,0,0.3)', borderRadius: '8px', opacity: '0' }}
            />
          </div>
          <div style={{ padding: '2em', maxWidth: '800px', minWidth: getState().isDesktop ? '550px' : undefined }}>
            <h1>{props.series.omdbMetadata.Title}</h1>
            <p style={{ fontSize: '0.8em' }}>
              {props.series.omdbMetadata.Year?.toString()} &nbsp; {props.series.omdbMetadata.Genre}
            </p>
            <p style={{ textAlign: 'justify' }}>{props.series.omdbMetadata.Plot}</p>
            {/* <div>
              {props.watchedSeconds ? (
                <span>
                  <RouteLink href={`/movies/watch/${props.movie._id}`}>
                    <Button variant="contained" color="primary">
                      Continue from{' '}
                      {(() => {
                        const date = new Date(0)
                        date.setSeconds(props.watchedSeconds)
                        return date.toISOString().substr(11, 8)
                      })()}
                    </Button>
                  </RouteLink>
                  <Button
                    onclick={async () => {
                      await injector.getInstance(MovieService).saveWatchProgress(props.movie, 0)
                      history.pushState({}, '', `/movies/watch/${props.movie._id}`)
                      injector.getInstance(LocationService).updateState()
                    }}>
                    Watch from the beginning
                  </Button>
                </span>
              ) : (
                <RouteLink href={`/movies/watch/${props.movie._id}`}>
                  <Button variant="contained" color="primary">
                    Start watching{' '}
                  </Button>
                </RouteLink>
              )}
              {getState().roles.includes('movie-admin') ? (
                <span>
                  <RouteLink href={`/movies/${props.movie.libraryId}/edit/${props.movie._id}`}>
                    <Button>Edit</Button>
                  </RouteLink>
                  {!props.movie.availableFormats?.length ? (
                    <Button
                      onclick={(ev) => {
                        ev.stopPropagation()
                        injector
                          .getInstance(MovieService)
                          .createEncodeTask(props.movie)
                          .then(() => {
                            injector.getInstance(NotyService).addNoty({
                              type: 'success',
                              title: 'Success',
                              body: `Encoding task created for '${props.movie.metadata.title}'`,
                            })
                          })
                          .catch((reason) => {
                            injector.getInstance(NotyService).addNoty({
                              type: 'error',
                              title: 'Error',
                              body: `Failed to create encoding task for '${
                                props.movie.metadata.title
                              }': ${reason.toString()}`,
                            })
                          })
                      }}>
                      Re-encode
                    </Button>
                  ) : null}
                </span>
              ) : null}
            </div> */}
          </div>
        </div>
      </div>
    )
  },
})
