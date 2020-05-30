import { Shade, createComponent } from '@furystack/shades'
import { sites } from '@common/config'

export const MediaPage = Shade({
  shadowDomName: 'multiverse-media-page',
  render: () => {
    return (
      <video id="videoPlayer" controls style={{ width: '100%', height: '100%' }} crossOrigin="use-credentials">
        <source src={`${sites.services.media.externalPath}/media/demo`} type='video/mp4; codecs="avc1.4d002a"' />
      </video>
    )
  },
})
