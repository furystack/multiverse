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
        additionalActions={[
          {
            name: 'Re-extract subtitles',
            action: async ({ entity, injector: i }) => {
              if (confirm('Are you sure you want to re-extract the subtitles from the stream?')) {
                await i.getInstance(MediaApiService).call({
                  method: 'POST',
                  action: '/movies/:movieId/re-extract-subtitles',
                  url: { movieId: entity._id },
                })
              }
            },
          },
          {
            name: 'Re-fetch metadata',
            action: async ({ entity, injector: i }) => {
              if (confirm('Are you sure you want to re-fetch the movie metadata?')) {
                await i.getInstance(MediaApiService).call({
                  method: 'POST',
                  action: '/movies/:movieId/re-fetch-metadata',
                  url: { movieId: entity._id },
                })
              }
            },
          },
          {
            name: 'Re-Encode',
            action: async ({ entity, injector: i }) => {
              if (confirm('Re-encoding takes a lot of time. Are you sure?')) {
                await i.getInstance(MediaApiService).call({
                  method: 'POST',
                  action: '/encode/reencode',
                  body: { movieId: entity._id },
                })
              }
            },
          },
        ]}
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
