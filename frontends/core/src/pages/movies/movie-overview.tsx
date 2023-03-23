import { SessionService } from '@common/frontend-utils'
import type { media } from '@common/models'
import { createComponent, LocationService, RouteLink, ScreenService, Shade } from '@furystack/shades'
import { Button, promisifyAnimation, NotyService } from '@furystack/shades-common-components'
import { MovieService } from '../../services/movie-service'

export const MovieOverview = Shade<{ movie: media.Movie; watchedSeconds: number; availableSubtitles: string[] }>({
  shadowDomName: 'shade-movie-overview',
  constructed: ({ element }) => {
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
  },
  render: ({ props, useObservable, injector }) => {
    const [currentUser] = useObservable('currentUser', injector.getInstance(SessionService).currentUser)
    const [isDesktop] = useObservable('isDesktop', injector.getInstance(ScreenService).screenSize.atLeast.md)

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
          }}
        >
          <div style={{ padding: '2em' }}>
            <img
              src={props.movie.metadata.thumbnailImageUrl}
              alt={`thumbnail for ${props.movie.metadata.title}`}
              style={{ boxShadow: '3px 3px 8px rgba(0,0,0,0.3)', borderRadius: '8px', opacity: '0' }}
            />
          </div>
          <div style={{ padding: '2em', maxWidth: '800px', minWidth: isDesktop ? '550px' : undefined }}>
            <h1>{props.movie.metadata.title}</h1>
            <p style={{ fontSize: '0.8em' }}>
              {props.movie.metadata.year?.toString()} &nbsp; {props.movie.metadata.genre.join(', ')}
            </p>
            <p style={{ textAlign: 'justify' }}>{props.movie.metadata.plot}</p>
            <div>
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
                    }}
                  >
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
              {currentUser?.roles.includes('movie-admin') ? (
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
                      }}
                    >
                      Re-encode
                    </Button>
                  ) : null}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    )
  },
})
