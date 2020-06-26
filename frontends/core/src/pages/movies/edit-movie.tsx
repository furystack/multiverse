import { Shade, createComponent } from '@furystack/shades'
import { media } from '@common/models'
import { GenericMonacoEditor } from '../../components/editors/generic-monaco-editor'

export const EditMovie = Shade<{ movie: media.Movie }>({
  shadowDomName: 'multiverse-edit-movie',
  render: ({ props }) => {
    return (
      <GenericMonacoEditor<media.Movie, 'mediaSchema', 'Movie'>
        title={`Edit movie "${props.movie.metadata.title}"`}
        schema="mediaSchema"
        entity={'Movie'}
        data={props.movie}
        onSave={async (movie: media.Movie) => {
          console.log('Movie Saving', movie)
        }}
      />
    )
  },
})
