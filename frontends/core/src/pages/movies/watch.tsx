import { Shade, createComponent } from '@furystack/shades'
import { ObservableValue } from '@furystack/utils'
import { media } from '@common/models'
import { sites } from '@common/config'
import { MediaApiService } from '@common/frontend-utils'

export const Watch = Shade<{ movie: media.Movie; watchedSeconds: number }, { watchedSeconds: ObservableValue<number> }>(
  {
    getInitialState: ({ props }) => ({
      watchedSeconds: new ObservableValue(props.watchedSeconds),
    }),
    shadowDomName: 'multiverse-movie-watch',
    constructed: ({ props, injector, getState, element }) => {
      const subscription = getState().watchedSeconds.subscribe((watchedSeconds) => {
        injector.getInstance(MediaApiService).call({
          method: 'POST',
          action: '/save-watch-progress',
          body: { movieId: props.movie._id, watchedSeconds },
        })
      })

      const interval = setInterval(() => {
        const video = element.querySelector('video') as HTMLVideoElement
        getState().watchedSeconds.setValue(video.currentTime)
      }, 1000 * 60)

      return () => {
        subscription.dispose()
        clearInterval(interval)
      }
    },
    render: ({ props }) => {
      return (
        <video
          id={`video-${props.movie._id}`}
          autoplay
          controls
          style={{ width: '100%', height: '100%' }}
          onerror={console.error}
          crossOrigin="use-credentials"
          onloadedmetadata={(ev) => {
            ;(ev.target as HTMLVideoElement).currentTime = props.watchedSeconds
          }}>
          <source src={`${sites.services.media.externalPath}/media/watch/${props.movie._id}`} type="video/mp4" />
        </video>
      )
    },
  },
)
