import { Shade, createComponent } from '@furystack/shades'
import { media } from '@common/models'
import { Fab } from '@furystack/shades-common-components'
import { IconUrlWidget } from '../../components/dashboard/icon-url-widget'

export const LibraryList = Shade<{ libraries: media.MovieLibrary[] }>({
  shadowDomName: 'multiverse-library-list',
  render: ({ props }) => {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {props.libraries.map((lib, index) => (
          <IconUrlWidget
            icon={lib.icon}
            url={`/movies/${lib._id}`}
            name={lib.name}
            description={lib.path}
            index={index}
          />
        ))}
        <Fab
          onclick={() => {
            window.history.pushState('', '', '/movies/add-new-movie-library')
          }}>
          ➕
        </Fab>
      </div>
    )
  },
})
