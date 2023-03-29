import { Shade, createComponent, LocationService } from '@furystack/shades'
import type { media } from '@common/models'
import { Input, Button } from '@furystack/shades-common-components'
import { useMediaApi } from '@common/frontend-utils'
import { FullScreenForm } from '../../components/full-screen-form'

export const AddMovieLibrary = Shade({
  shadowDomName: 'multiverse-add-movie-library',

  render: ({ injector, useState }) => {
    const [newMovieLib, setNewMovieLib] = useState<Pick<media.MovieLibrary, 'name' | 'path' | 'icon'>>('newMovieLib', {
      path: '',
      icon: '🍿',
      name: '',
    })

    return (
      <FullScreenForm
        title="Create Movie Library"
        actions={
          <div>
            <Button
              variant="outlined"
              title="Back"
              onclick={() => {
                history.pushState({}, '', '/movies')
                injector.getInstance(LocationService).updateState()
              }}
            >
              Back
            </Button>
            <Button variant="contained" color="primary" type="submit">
              Create Movie Library
            </Button>
          </div>
        }
        onSubmit={async (ev) => {
          ev.preventDefault()
          await useMediaApi(injector)({
            method: 'POST',
            action: '/movie-libraries',
            body: newMovieLib,
          })
          window.history.pushState('', '', '/movies?refresh=1')
        }}
      >
        <Input
          value={newMovieLib.name}
          labelTitle="Name"
          required
          onTextChange={(text) => setNewMovieLib({ ...newMovieLib, name: text })}
        />
        <Input
          value={newMovieLib.path}
          labelTitle="Path"
          required
          onTextChange={(text) => setNewMovieLib({ ...newMovieLib, path: text })}
        />
        <Input
          value={newMovieLib.icon}
          labelTitle="Icon"
          required
          onTextChange={(text) => setNewMovieLib({ ...newMovieLib, icon: text })}
        />
      </FullScreenForm>
    )
  },
})
