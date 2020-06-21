import { Shade, createComponent, PartialElement } from '@furystack/shades'
import { ObservableValue } from '@furystack/utils'
import { media } from '@common/models'
import { sites } from '@common/config'
import { MediaApiService } from '@common/frontend-utils'
import 'videojs-contrib-dash'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace JSX {
    interface IntrinsicElements {
      'video-js': PartialElement<HTMLVideoElement>
    }
  }
}

export const Watch = Shade<{ movie: media.Movie; watchedSeconds: number }, { watchedSeconds: ObservableValue<number> }>(
  {
    getInitialState: ({ props }) => ({
      watchedSeconds: new ObservableValue(props.watchedSeconds),
    }),
    shadowDomName: 'multiverse-movie-watch',
    constructed: ({ props, injector, getState, element }) => {
      const player = videojs(element.querySelector('video-js'), {
        poster: props.movie.metadata.thumbnailImageUrl,
        html5: {
          nativeCaptions: false,
        },
        controls: true,
        autoplay: true,
      })
      player.ready(() => {
        player.src({
          src: `${sites.services.media.externalPath}/media/watch-dash/${props.movie._id}/dash.mpd`,
          type: 'application/dash+xml',
        })

        player.currentTime(props.watchedSeconds)
        player.play()
      })

      const subscription = getState().watchedSeconds.subscribe((watchedSeconds) => {
        injector.getInstance(MediaApiService).call({
          method: 'POST',
          action: '/save-watch-progress',
          body: { movieId: props.movie._id, watchedSeconds },
        })
      })

      const interval = setInterval(() => {
        getState().watchedSeconds.setValue(player.currentTime())
      }, 1000 * 60)

      return () => {
        player.dispose()
        subscription.dispose()
        clearInterval(interval)
      }
    },
    render: () => {
      return (
        <video-js
          className="video-js video-js-default-skin"
          style={{ width: '100%', height: '100%' }}
          crossOrigin="use-credentials"></video-js>
      )
    },
  },
)
