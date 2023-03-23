import { Shade, createComponent } from '@furystack/shades'
import type { media } from '@common/models'
import { SeriesWidget } from '../../components/dashboard/series-widget'

export const SeriesList = Shade<{
  series: media.Series[]
  movies: media.Movie[]
  watchProgresses: media.MovieWatchHistoryEntry[]
}>({
  shadowDomName: 'multiverse-series-list',
  render: ({ props }) => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          overflow: 'auto',
          width: '100%',
        }}
      >
        {props.series.sortBy('_id', 'desc').map((s, index) => (
          <SeriesWidget
            size={348}
            series={s}
            index={index}
            watchHistoryEntries={props.watchProgresses.filter((wp) => {
              return props.movies.some((m) => m.metadata.seriesId === s.imdbId && m._id === wp.movieId)
            })}
          />
        ))}
      </div>
    )
  },
})
