import { Shade, createComponent } from '@furystack/shades'
import { media } from '@common/models'
import { IconUrlWidget } from '../../components/dashboard/icon-url-widget'

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
        {props.movies.map((m, index) => {
          return <IconUrlWidget index={index} icon="🍿" name={m.path} url={`/movies/watch/${m._id}`} />
        })}
      </div>
    )
  },
})
