import { Shade, createComponent } from '@furystack/shades'
import type { media } from '@common/models'
import { GenericMonacoEditor } from '../../../components/editors/generic-monaco-editor'

export const EncodingTaskDetails = Shade<{ encodingTask: media.EncodingTask }>({
  shadowDomName: 'encoding-task-details',
  render: ({ props }) => {
    return (
      <GenericMonacoEditor<media.EncodingTask, 'mediaSchema', 'EncodingTask'>
        schema="mediaSchema"
        entity="EncodingTask"
        data={props.encodingTask}
        title={`Encoding task for ${props.encodingTask.mediaInfo.movie.metadata.title}`}
        readOnly
      />
    )
  },
})
