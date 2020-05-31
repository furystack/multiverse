import { Shade, createComponent } from '@furystack/shades'
import { media } from '@common/models'
import { Input, Button } from '@furystack/shades-common-components'
import { MediaApiService } from '@common/frontend-utils'

export const NewMovieLibrary = Shade<unknown, Partial<media.MovieLibrary>>({
  shadowDomName: 'multiverse-new-movie-library',
  getInitialState: () => ({
    path: '',
  }),
  render: ({ getState, updateState, injector }) => {
    return (
      <div>
        <form
          onsubmit={async (ev) => {
            ev.preventDefault()
            await injector.getInstance(MediaApiService).call({
              method: 'POST',
              action: '/movie-libraries',
              body: getState(),
            })
            window.history.pushState('', '', '/movies?refresh=1')
          }}>
          <Input
            value={getState().path}
            labelTitle="Path"
            required
            onTextChange={(text) => updateState({ path: text })}
          />
          <Input
            value={getState().name}
            labelTitle="Name"
            required
            onTextChange={(text) => updateState({ name: text })}
          />
          <Input
            value={getState().icon}
            labelTitle="Icon"
            required
            onTextChange={(text) => updateState({ icon: text })}
          />
          <Button type="submit">Create Movie Library</Button>
        </form>
      </div>
    )
  },
})
