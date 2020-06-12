import { Shade, RouteLink, createComponent } from '@furystack/shades'
import { media } from '@common/models'
import { promisifyAnimation } from '@furystack/shades-common-components'
import { IconUrlWidget } from './icon-url-widget'

export const MovieWidget = Shade<{ movie: media.Movie; index: number }, { hasMetadata: boolean }>({
  getInitialState: ({ props }) => ({ hasMetadata: media.isValidOmdbMetadata(props.movie.omdbMeta) }),
  shadowDomName: 'multiverse-movie-widget',
  constructed: ({ props, element, getState }) => {
    if (getState().hasMetadata) {
      setTimeout(() => {
        promisifyAnimation(element.querySelector('a'), [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
          fill: 'forwards',
          delay: 500 + (props.index || Math.random() * 10) * 100,
          duration: 200,
        })
      })
    }
  },
  render: ({ props }) => {
    const { movie } = props
    const meta = movie.omdbMeta
    const url = `/movies/watch/${movie._id}`
    if (media.isValidOmdbMetadata(meta)) {
      return (
        <RouteLink
          title={meta.Plot}
          onmouseenter={(ev) =>
            promisifyAnimation(
              ev.target as any,
              [{ filter: 'saturate(0.3)brightness(0.6)' }, { filter: 'saturate(1)brightness(1)' }],
              {
                duration: 500,
                fill: 'forwards',
                easing: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
              },
            )
          }
          onmouseleave={(ev) =>
            promisifyAnimation(
              ev.target as any,
              [{ filter: 'saturate(1)brightness(1)' }, { filter: 'saturate(0.3)brightness(0.6)' }],
              {
                duration: 500,
                fill: 'forwards',
                easing: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
              },
            )
          }
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            width: '256px',
            height: '256px',
            filter: 'saturate(0.3)brightness(0.6)',
            background: 'rgba(128,128,128,0.1)',
            transform: 'scale(0)',
            borderRadius: '8px',
          }}
          href={url}>
          <div
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
            onclick={(ev) => {
              if (url.startsWith('http') && new URL(url).href !== window.location.href) {
                ev.preventDefault()
                ev.stopImmediatePropagation()
                window.location.replace(url)
              }
            }}>
            <img src={meta.Poster} alt={meta.Title} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            {/* </div> */}
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
              }}>
              {meta.Title}
            </div>
          </div>
        </RouteLink>
      )
    } else {
      return <IconUrlWidget index={props.index} icon="🍿" name={movie.path} url={url} />
    }
  },
})
