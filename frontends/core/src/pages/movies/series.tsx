import { media } from '@common/models'
import { PartialResult } from '@furystack/core'
import { createComponent, ScreenService, Shade } from '@furystack/shades'
import { promisifyAnimation } from '@furystack/shades-common-components'
import { MovieListWidget } from '../../components/dashboard/movie-list'

export interface SeriesListProps {
  series: media.Series
  movies: Array<PartialResult<media.Movie, ['_id', 'metadata']>>
}

export const SeriesPage = Shade<SeriesListProps, { isDesktop: boolean }>({
  shadowDomName: 'series-page',
  getInitialState: ({ injector }) => ({
    isDesktop: injector.getInstance(ScreenService).screenSize.atLeast.md.getValue(),
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
    const subscribers = [
      injector.getInstance(ScreenService).screenSize.atLeast.md.subscribe((isDesktop) => updateState({ isDesktop })),
    ]
    return () => subscribers.forEach((sub) => sub.dispose())
  },
  render: ({ props, getState }) => {
    const { isDesktop } = getState()

    const seasons = Array.from(
      new Set(props.movies.map((m) => m.metadata.season).filter((s) => !isNaN(s as number))),
    ).sort() as number[]

    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            flexWrap: !isDesktop ? 'wrap' : undefined,
          }}
        >
          <div style={{ padding: '2em' }}>
            <img
              src={props.series.omdbMetadata.Poster}
              alt={`thumbnail for ${props.series.omdbMetadata.Title}`}
              style={{ boxShadow: '3px 3px 8px rgba(0,0,0,0.3)', borderRadius: '8px', opacity: '0' }}
            />
          </div>
          <div
            style={{
              padding: '2em',
              maxWidth: '800px',
              minWidth: isDesktop ? '550px' : undefined,
              maxHeight: isDesktop ? 'calc(100% - 128px)' : undefined,
              overflow: 'hidden',
              overflowY: isDesktop ? 'auto' : undefined,
            }}
          >
            <h1>{props.series.omdbMetadata.Title}</h1>
            <p style={{ fontSize: '0.8em' }}>
              {props.series.omdbMetadata.Year?.toString()} &nbsp; {props.series.omdbMetadata.Genre}
            </p>
            <p style={{ textAlign: 'justify' }}>{props.series.omdbMetadata.Plot}</p>
            <div style={{ width: '100%', overflow: 'hidden' }}>
              {seasons.map((s) => (
                <MovieListWidget
                  align="flex-start"
                  movieIds={props.movies.filter((m) => m.metadata.season === s).map((m) => m._id)}
                  title={`Season ${s}`}
                  size={256}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  },
})
