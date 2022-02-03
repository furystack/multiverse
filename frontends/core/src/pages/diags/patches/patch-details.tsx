import { Shade, createComponent } from '@furystack/shades'
import { diag } from '@common/models'
import { GenericMonacoEditor } from '../../../components/editors/generic-monaco-editor'

export const PatchDetails = Shade<{ entry: diag.Patch }>({
  shadowDomName: 'shade-patch-entry-details',
  render: ({ props }) => {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}>
        <GenericMonacoEditor<diag.Patch, 'diagSchema', 'Patch'>
          schema="diagSchema"
          entity="Patch"
          title="Event details"
          data={props.entry}
          readOnly={true}
        />
      </div>
    )
  },
})
