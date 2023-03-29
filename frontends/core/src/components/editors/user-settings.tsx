import { Shade, createComponent } from '@furystack/shades'
import { deepMerge } from '@furystack/utils'
import { auth } from '@common/models'
import { useAuthApi, SessionService } from '@common/frontend-utils'
import { GenericMonacoEditor } from './generic-monaco-editor'

export const UserSettingsEditor = Shade({
  shadowDomName: 'user-settings-editor',
  render: ({ injector, useObservable }) => {
    const sessionService = injector.getInstance(SessionService)
    const [profile] = useObservable('userSettings', sessionService.currentProfile)
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
          data={profile.userSettings}
          title="Edit your user settings"
          onSave={async (settings) => {
            await useAuthApi(injector)({
              method: 'PATCH',
              action: '/profiles/:id',
              url: { id: profile._id },
              body: { userSettings: settings },
            })
            sessionService.reloadProfile()
          }}
        />
      </div>
    )
  },
})
