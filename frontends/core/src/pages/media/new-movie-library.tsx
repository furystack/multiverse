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
          onsubmit={(ev) => {
            ev.preventDefault()
            injector.getInstance(MediaApiService).call({
              method: 'POST',
              action: '/movie-libraries',
              body: getState(),
            })
          }}>
          <Input
            value={getState().path}
            labelTitle="Path"
            required
            onTextChange={(text) => updateState({ path: text })}
          />
          <Button type="submit">Create Movie Library</Button>
        </form>
      </div>
    )
  },
})
