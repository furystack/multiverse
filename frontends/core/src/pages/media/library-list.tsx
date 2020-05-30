import { Shade, createComponent } from '@furystack/shades'
import { media } from '@common/models'
import { Fab } from '@furystack/shades-common-components'

export const LibraryList = Shade<{ libraries: media.MovieLibrary[] }>({
  shadowDomName: 'multiverse-library-list',
  render: ({ props }) => {
    return (
      <div>
        {JSON.stringify(props.libraries)}{' '}
        <Fab
          onclick={() => {
            window.history.pushState('', '', '/media/add-new-movie-library')
          }}>
          ➕
        </Fab>
      </div>
    )
  },
})
