import { Shade, createComponent } from '@furystack/shades'
import type { auth } from '@common/models'
import { useAuthApi } from '@common/frontend-utils'
import { GenericMonacoEditor } from '../../components/editors/generic-monaco-editor'

export const EditUserPage = Shade<{ entry: auth.User }>({
  shadowDomName: 'shade-edit-user-page',
  render: ({ props, injector }) => {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}
      >
        <GenericMonacoEditor<auth.User, 'authSchema', 'User'>
          schema="authSchema"
          entity="User"
          title="Edit User"
          data={props.entry}
          onSave={async (entry) => {
            const { _id, ...patchData } = entry
            await useAuthApi(injector)({
              method: 'PATCH',
              action: '/users/:id',
              url: {
                id: _id,
              },
              body: patchData,
            })
          }}
        />
      </div>
    )
  },
})
