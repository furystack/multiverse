import type { PartialElement } from '@furystack/shades'
import { Shade, createComponent } from '@furystack/shades'
import { ObservableValue, PathHelper } from '@furystack/utils'
import type { media } from '@common/models'
import { sites } from '@common/config'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { EnvironmentService } from '@common/frontend-utils'
import { MovieService } from '../../services/movie-service'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace JSX {
    interface IntrinsicElements {
      'video-js': PartialElement<HTMLVideoElement>
    }
  }
}

export const Watch = Shade<
  { movie: media.Movie; watchedSeconds: number; availableSubtitles: string[] },
  { watchedSeconds: ObservableValue<number> }
>({
  getInitialState: ({ props }) => ({
    watchedSeconds: new ObservableValue(props.watchedSeconds),
  }),
  shadowDomName: 'multiverse-movie-watch',
  constructed: ({ props, injector, getState, element }) => {
    const formats = props.movie.availableFormats || []
    const subtitleStreams = props.movie.ffprobe.streams.filter((s) => (s.codec_type as any) === 'subtitle')
    const sources = [
      ...formats.sortBy('codec', 'desc').map((f) => ({
        src: PathHelper.joinPaths(
          injector.getInstance(EnvironmentService).siteRoots.media,
          sites.services.media.apiPath,
          'watch-stream',
          props.movie._id,
          f.codec,
          f.mode,
          'dash.mpd',
        ),
        type: f.mode === 'dash' ? 'application/dash+xml' : 'unknown',
        withCredentials: true,
      })),

      {
        src: `${sites.services.media.apiPath}/stream-original/${props.movie._id}`,
        type: 'video/mp4',
      },
    ]

    const player = videojs(element.querySelector('video-js') as HTMLElement, {
      poster: props.movie.metadata.thumbnailImageUrl,
      html5: {
        nativeCaptions: false,
        nativeAudioTracks: formats && formats.length ? false : undefined,
        dash: {
          setXHRWithCredentialsForType: [undefined, true],
        },
      },
      controls: true,
      autoplay: true,
      sources,
      tracks: subtitleStreams.map((s) => ({
        language: s.tags.language,
        label: s.tags.title || s.tags.language,
        kind: 'subtitles',
        src: `${sites.services.media.apiPath}/movies/${props.movie._id}/subtitles/${encodeURIComponent(
          `extracted/stream${s.index}.vtt`,
        )}`,
      })),
    })

    player.currentTime(props.watchedSeconds)

    props.availableSubtitles.map((subtitle) =>
      player.addRemoteTextTrack(
        {
          label: 'English',
          src: `${sites.services.media.apiPath}/movies/${props.movie._id}/subtitles/${subtitle}`,
        },
        false,
      ),
    )

    player.on('error', (_ev) => {
      if (confirm('There was an error during encoded video playback. Try the original content?'))
        player.src({
          src: `${sites.services.media.apiPath}/stream-original/${props.movie._id}`,
          type: 'video/mp4',
        })
      player.currentTime(props.watchedSeconds)
      player.play()
    })

    player.on('pause', () => {
      getState().watchedSeconds.setValue(player.currentTime())
    })

    const subscription = getState().watchedSeconds.subscribe((watchedSeconds) => {
      injector.getInstance(MovieService).saveWatchProgress(props.movie, watchedSeconds)
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
        crossOrigin="use-credentials"
      ></video-js>
    )
  },
})
