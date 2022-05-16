import { Shade, RouteLink, createComponent, LocationService, LazyLoad } from '@furystack/shades'
import { media, auth } from '@common/models'
import { promisifyAnimation } from '@furystack/shades-common-components'
import { SessionService, MediaApiService } from '@common/frontend-utils'
import { Icon } from '../icon'

const focus = (el: HTMLElement) => {
  promisifyAnimation(el, [{ filter: 'saturate(0.3)brightness(0.6)' }, { filter: 'saturate(1)brightness(1)' }], {
    duration: 500,
    fill: 'forwards',
    easing: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
  })
  promisifyAnimation(
    el.querySelector('img.cover') as HTMLImageElement,
    [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }],
    {
      fill: 'forwards',
      easing: 'cubic-bezier(0.310, 0.805, 0.605, 1.145)',
      duration: 850,
    },
  )
}

const blur = (el: HTMLElement) => {
  promisifyAnimation(el, [{ filter: 'saturate(1)brightness(1)' }, { filter: 'saturate(0.3)brightness(0.6)' }], {
    duration: 500,
    fill: 'forwards',
    easing: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
  })
  promisifyAnimation(
    el.querySelector('img.cover') as HTMLImageElement,
    [{ transform: 'scale(1.1)' }, { transform: 'scale(1)' }],
    { fill: 'forwards', duration: 150 },
  )
}

export const MovieWidget = Shade<
  {
    size: number
    movie: media.Movie
    index: number
    watchHistory?: media.MovieWatchHistoryEntry
  },
  { currentUser: Omit<auth.User, 'password'> | null }
>({
  shadowDomName: 'multiverse-movie-widget',
  getInitialState: ({ injector }) => ({ currentUser: injector.getInstance(SessionService).currentUser.getValue() }),
  constructed: ({ props, element }) => {
    setTimeout(() => {
      promisifyAnimation(
        element.querySelector('route-link div'),
        [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
        {
          fill: 'forwards',
          delay: (props.index || 0) * 160 + Math.random() * 100,
          duration: 700,
          easing: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
        },
      )
    })
  },
  render: ({ props, injector, getState }) => {
    const { movie } = props
    const meta = movie.metadata
    const url = `/movies/overview/${movie._id}`
    return (
      <RouteLink tabIndex={0} title={meta.plot || meta.title} href={url}>
        <div
          onfocus={(ev) => focus(ev.target as HTMLElement)}
          onblur={(ev) => blur(ev.target as HTMLElement)}
          onmouseenter={(ev) => focus(ev.target as HTMLElement)}
          onmouseleave={(ev) => blur(ev.target as HTMLElement)}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            width: `${props.size}px`,
            height: `${props.size}px`,
            filter: 'saturate(0.3)brightness(0.6)',
            background: 'rgba(128,128,128,0.1)',
            transform: 'scale(0)',
            borderRadius: '4px',
            margin: '8px',
            overflow: 'hidden',
            color: 'white',
          }}
          onclick={(ev) => {
            if (url.startsWith('http') && new URL(url).href !== window.location.href) {
              ev.preventDefault()
              ev.stopImmediatePropagation()
              window.location.replace(url)
            }
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              zIndex: '1',
              fontSize: '1.3em',
              width: 'calc(100% - 2em)',
              display: 'flex',
              margin: '1em',
              justifyContent: 'space-between',
              filter: 'drop-shadow(black 0px 0px 5px) drop-shadow(black 0px 0px 8px) drop-shadow(black 0px 0px 10px)',
            }}
          >
            <div style={{ display: 'flex' }}>
              <div
                title="Play movie"
                style={{ width: '16px' }}
                onclick={(ev) => {
                  ev.stopImmediatePropagation()
                  ev.preventDefault()
                  window.history.pushState({}, '', `/movies/watch/${props.movie._id}`)
                  injector.getInstance(LocationService).updateState()
                }}
              >
                <Icon icon={{ type: 'flaticon-essential', name: '025-play button.svg' }} />
              </div>
            </div>
            {getState().currentUser?.roles.includes('movie-admin') ? (
              <div style={{ display: 'flex' }}>
                {movie.availableFormats?.length ? null : (
                  <div
                    style={{ width: '16px' }}
                    title="The media encoding for this movie has not finished. Pls re-encode it."
                  >
                    <Icon icon={{ type: 'flaticon-essential', name: '058-error.svg' }} />
                  </div>
                )}
                <div
                  style={{ width: '16px', height: '16px', marginLeft: '1em' }}
                  onclick={(ev) => {
                    ev.preventDefault()
                    ev.stopImmediatePropagation()
                    history.pushState('', '', `/movies/${movie.libraryId}/edit/${movie._id}`)
                    injector.getInstance(LocationService).updateState()
                  }}
                  title="Edit movie details"
                >
                  <Icon icon={{ type: 'flaticon-essential', name: '218-edit.svg' }} />
                </div>
              </div>
            ) : null}
          </div>
          <img
            src={meta.thumbnailImageUrl}
            alt={meta.title}
            className="cover"
            style={{
              display: 'inline-block',
              backgroundColor: '#666',
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              transform: 'scale(1)',
            }}
          />
          <div
            style={{
              width: 'calc(100% - 2em)',
              overflow: 'hidden',
              textAlign: 'center',
              textOverflow: 'ellipsis',
              position: 'absolute',
              bottom: '0',
              whiteSpace: 'nowrap',
              padding: '1em',
              background: 'rgba(0,0,0,0.7)',
            }}
          >
            {meta.title}
            <LazyLoad
              loader={<div />}
              component={async () => {
                const watchProgress =
                  props.watchHistory ||
                  (movie.metadata.duration &&
                    (
                      await injector.getInstance(MediaApiService).call({
                        method: 'GET',
                        action: '/my-watch-progress',
                        query: {
                          findOptions: {
                            filter: {
                              movieId: { $eq: movie._id },
                            },
                            select: ['watchedSeconds'],
                          },
                        },
                      })
                    ).result.entries[0])

                const percent =
                  watchProgress &&
                  Math.round(
                    100 *
                      (watchProgress.watchedSeconds / (parseFloat((movie.ffprobe as any).format.duration) || Infinity)),
                  )

                return (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      height: '2px',
                      width: `${percent}%`,
                      background: 'rgba(96,96,255,0.5)',
                    }}
                  />
                )
              }}
            />
          </div>
        </div>
      </RouteLink>
    )
  },
})
