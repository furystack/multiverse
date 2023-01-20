import { Shade, createComponent } from '@furystack/shades'
import type { diag } from '@common/models'
import { GenericMonacoEditor } from '../../../components/editors/generic-monaco-editor'

export const EntryDetails = Shade<{ entry: diag.LogEntry<any> }>({
  shadowDomName: 'shade-system-log-entry-details',
  render: ({ props }) => {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}
      >
        <GenericMonacoEditor<diag.LogEntry<any>, 'diagSchema', 'LogEntry'>
          schema="diagSchema"
          entity="LogEntry"
          title="Event details"
          data={props.entry}
          readOnly={true}
        />
      </div>
    )
  },
})
