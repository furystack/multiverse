import { Shade, createComponent } from '@furystack/shades'
import { media } from '@common/models'
import { MovieWidget } from '../../components/dashboard/movie-widget'

export const MovieList = Shade<{ movies: media.Movie[] }>({
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
          height: '100%',
        }}>
        {props.movies.map((m, index) => (
          <MovieWidget size={348} movie={m} index={index} />
        ))}
      </div>
    )
  },
})
