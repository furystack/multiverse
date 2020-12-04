import { Shade, createComponent } from '@furystack/shades'
import { deepMerge } from '@furystack/utils'
import { auth } from '@common/models'
import { AuthApiService } from '@common/frontend-utils'
import { defaultDarkTheme, defaultLightTheme, ThemeProviderService } from '@furystack/shades-common-components'
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
          await injector.getInstance(AuthApiService).call({
            method: 'PATCH',
            action: '/profiles/:id',
            url: { id: props.profileId },
            body: { userSettings: settings },
          })
          const themeProvider = injector.getInstance(ThemeProviderService)
          themeProvider.theme.setValue(
            deepMerge(themeProvider.theme.getValue(), settings.theme === 'dark' ? defaultDarkTheme : defaultLightTheme),
          )
        }}
      />
    )
  },
})
