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
          dash: {
            setXHRWithCredentialsForType: [undefined, true],
          },
        },
        controls: true,
        autoplay: true,
      })

      player.currentTime(props.watchedSeconds)

      player.ready(() => {
        const formats = props.movie.availableFormats
        if (formats && formats.length === 1) {
          player.src(
            formats.map((f) => ({
              src: `${sites.services.media.apiPath}/watch-stream/${props.movie._id}/${f.codec}/${f.mode}/dash.mpd`,
              type: f.mode === 'dash' ? 'application/dash+xml' : 'unknown',
              withCredentials: true,
            }))[0],
          )
        } else {
          player.src({
            src: `${sites.services.media.apiPath}/stream-original/${props.movie._id}`,
            type: 'video/mp4',
          })
        }

        player.play()
        player.on('error', (_ev) => {
          if (confirm('There was an error during encoded video playback. Try the original content?'))
            player.src({
              src: `${sites.services.media.apiPath}/stream-original/${props.movie._id}`,
              type: 'video/mp4',
            })
          player.currentTime(props.watchedSeconds)
          player.play()
        })
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

      return async () => {
        getState().watchedSeconds.setValue(player.currentTime())
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
