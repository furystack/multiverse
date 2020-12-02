import { Shade, createComponent } from '@furystack/shades'
import { auth } from '@common/models'
import { AuthApiService } from '@common/frontend-utils'
import { GenericMonacoEditor } from './generic-monaco-editor'

export const UserSettingsEditor = Shade<{ settings: auth.UserSettings; profileId: string }>({
  shadowDomName: 'user-settings-editor',
  render: ({ props, injector }) => {
    return (
      <GenericMonacoEditor<auth.UserSettings, 'authSchema', 'UserSettings'>
        schema="authSchema"
        entity="UserSettings"
        data={props.settings}
        title="Edit your user settings"
        onSave={async (settings) => {
          injector.getInstance(AuthApiService).call({
            method: 'PATCH',
            action: '/profiles/:id',
            url: { id: props.profileId },
            body: { userSettings: settings },
          })
        }}
      />
    )
  },
})
