import { Shade, createComponent, LocationService } from '@furystack/shades'
import { media } from '@common/models'
import { Input, Button } from '@furystack/shades-common-components'
import { MediaApiService } from '@common/frontend-utils'
import { FullScreenForm } from '../../components/full-screen-form'

export const AddMovieLibrary = Shade<unknown, Pick<media.MovieLibrary, 'name' | 'path' | 'icon'>>({
  shadowDomName: 'multiverse-add-movie-library',
  getInitialState: () => ({
    path: '',
    icon: '🍿',
    name: '',
  }),
  render: ({ getState, updateState, injector }) => {
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
          await injector.getInstance(MediaApiService).call({
            method: 'POST',
            action: '/movie-libraries',
            body: getState(),
          })
          window.history.pushState('', '', '/movies?refresh=1')
        }}
      >
        <Input
          value={getState().name}
          labelTitle="Name"
          required
          onTextChange={(text) => updateState({ name: text }, true)}
        />
        <Input
          value={getState().path}
          labelTitle="Path"
          required
          onTextChange={(text) => updateState({ path: text }, true)}
        />
        <Input
          value={getState().icon}
          labelTitle="Icon"
          required
          onTextChange={(text) => updateState({ icon: text }, true)}
        />
      </FullScreenForm>
    )
  },
})
