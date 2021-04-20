import { SessionService } from '@common/frontend-utils'
import { auth, media } from '@common/models'
import { createComponent, LocationService, RouteLink, Shade } from '@furystack/shades'
import { Button, promisifyAnimation } from '@furystack/shades-common-components'
import { MovieService } from '../../services/movie-service'

export const MovieOverview = Shade<
  { movie: media.Movie; watchedSeconds: number; availableSubtitles: string[] },
  { roles: auth.User['roles'] }
>({
  getInitialState: ({ injector }) => ({
    roles: injector.getInstance(SessionService).currentUser.getValue()?.roles || [],
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
    const roleSubscriber = injector.getInstance(SessionService).currentUser.subscribe((usr) => {
      updateState({ roles: usr?.roles })
    })
    return () => roleSubscriber.dispose()
  },
  render: ({ props, getState, injector }) => {
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
              src={props.movie.metadata.thumbnailImageUrl}
              alt={`thumbnail for ${props.movie.metadata.title}`}
              style={{ boxShadow: '3px 3px 8px rgba(0,0,0,0.3)', borderRadius: '8px', opacity: '0' }}
            />
          </div>
          <div style={{ padding: '2em', maxWidth: '800px', minWidth: '550px' }}>
            <h1>{props.movie.metadata.title}</h1>
            <p style={{ fontSize: '0.8em' }}>
              {props.movie.metadata.year?.toString()} &nbsp; {props.movie.metadata.genre.join(', ')}
            </p>
            <p>{props.movie.metadata.plot}</p>
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
                <RouteLink href={`/movies/${props.movie.libraryId}/edit/${props.movie._id}`}>
                  <Button>Edit</Button>
                </RouteLink>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    )
  },
})
