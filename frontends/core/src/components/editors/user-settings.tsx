import { Shade, createComponent } from '@furystack/shades'
import { deepMerge } from '@furystack/utils'
import { auth } from '@common/models'
import { AuthApiService, SessionService } from '@common/frontend-utils'
import { GenericMonacoEditor } from './generic-monaco-editor'

export const UserSettingsEditor = Shade<{ settings: auth.UserSettings; profileId: string }>({
  shadowDomName: 'user-settings-editor',
  render: ({ props, injector }) => {
    return (
      <div
        style={{
          height: 'calc(100% - 195px)',
          flexGrow: '1',
          position: 'absolute',
          width: 'calc(100% - 50px)',
          margin: '0 20px',
        }}
      >
        <GenericMonacoEditor<auth.UserSettings, 'authSchema', 'UserSettings'>
          schema="authSchema"
          entity="UserSettings"
          data={props.settings}
          title="Edit your user settings"
          onSave={async (settings) => {
            await injector.getInstance(AuthApiService).call({
              method: 'PATCH',
              action: '/profiles/:id',
              url: { id: props.profileId },
              body: { userSettings: settings },
            })
            const profile = injector.getInstance(SessionService).currentProfile
            await profile.setValue({
              ...profile.getValue(),
              userSettings: deepMerge({ ...auth.DefaultUserSettings }, settings),
            })
          }}
        />
      </div>
    )
  },
})
