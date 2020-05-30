import { Shade, createComponent } from '@furystack/shades'
import { media } from '@common/models'
import { sites } from '@common/config'

export const Watch = Shade<{ movie: media.Movie }>({
  shadowDomName: 'multiverse-movie-watch',
  render: ({ props }) => {
    return (
      <video
        id={`video-${props.movie._id}`}
        controls
        style={{ width: '100%', height: '100%' }}
        onerror={console.error}
        crossOrigin="use-credentials">
        <source src={`${sites.services.media.externalPath}/media/watch/${props.movie._id}`} type="video/mp4" />
      </video>
    )
  },
})
