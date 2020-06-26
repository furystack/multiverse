import { Shade, createComponent } from '@furystack/shades'
import { media } from '@common/models'
import { MediaApiService } from '@common/frontend-utils'
import { GenericMonacoEditor } from '../../components/editors/generic-monaco-editor'

export const EditMovie = Shade<{ movie: media.Movie }>({
  shadowDomName: 'multiverse-edit-movie',
  render: ({ props, injector }) => {
    return (
      <GenericMonacoEditor<media.Movie, 'mediaSchema', 'Movie'>
        title={`Edit movie "${props.movie.metadata.title}"`}
        schema="mediaSchema"
        entity={'Movie'}
        data={props.movie}
        onSave={async (movie: media.Movie) => {
          const { _id, ...body } = movie
          await injector.getInstance(MediaApiService).call({
            method: 'PATCH',
            action: '/movies/:id',
            url: { id: movie._id },
            body,
          })
        }}
      />
    )
  },
})
