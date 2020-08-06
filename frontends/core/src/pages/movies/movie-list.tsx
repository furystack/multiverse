import { Shade, createComponent } from '@furystack/shades'
import { media } from '@common/models'
import { MovieWidget } from '../../components/dashboard/movie-widget'

export const MovieList = Shade<
  { movies: media.Movie[] },
  { orderedMovies: media.Movie[]; order: keyof media.Movie; orderType: 'asc' | 'desc' }
>({
  getInitialState: ({ props }) => ({
    order: '_id',
    orderType: 'desc',
    orderedMovies: props.movies.sortBy('_id', 'desc'),
  }),
  shadowDomName: 'multiverse-movie-list',
  render: ({ getState }) => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          overflow: 'auto',
          width: '100%',
          height: '100%',
        }}>
        {getState().orderedMovies.map((m, index) => (
          <MovieWidget size={348} movie={m} index={index} />
        ))}
      </div>
    )
  },
})
