import { Shade, createComponent } from '@furystack/shades'
import type { media } from '@common/models'
import { MovieWidget } from '../../components/dashboard/movie-widget'

export const MovieList = Shade<{ movies: media.Movie[]; watchProgresses: media.MovieWatchHistoryEntry[] }>({
  shadowDomName: 'multiverse-movie-list',
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
        {props.movies.sortBy('_id', 'desc').map((m, index) => (
          <MovieWidget
            size={348}
            movie={m}
            index={index}
            watchHistory={props.watchProgresses?.find((wp) => wp.movieId === m._id)}
          />
        ))}
      </div>
    )
  },
})
