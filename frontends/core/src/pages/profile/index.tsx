import { Shade, createComponent } from '@furystack/shades'
import { Tabs } from '@furystack/shades-common-components'
import type { auth } from '@common/models'
import { ChangePasswordForm } from '../../components/change-password-form'
import { ProfileGeneralInfo } from './general-info'
import { ProfileLogin } from './login'
import { UserSettingsEditor } from '../../components/editors/user-settings'

export const ProfilePage = Shade<{
  loginProviderDetails: {
    google?: auth.GoogleAccount | undefined
    github?: auth.GithubAccount | undefined
    hasPassword: boolean
  }
}>({
  shadowDomName: 'shade-multiverse-profile',
  render: ({ props }) => {
    const { loginProviderDetails } = props
    return (
      <Tabs
        tabs={[
          { header: <span>🎴 General info</span>, hash: 'general', component: <ProfileGeneralInfo /> },
          {
            header: <span>🚪 Login</span>,
            hash: 'login',
            component: <ProfileLogin loginProviderDetails={loginProviderDetails} />,
          },
          {
            header: <span> 🔑 Change Password</span>,
            hash: 'change-password',
            component: (
              <div>
                <ChangePasswordForm
                  showCurrentPassword={loginProviderDetails.hasPassword}
                  onUpdated={() => {
                    // reloadProviderDetails() // TODO
                  }}
                />
              </div>
            ),
          },
          {
            header: <span>⚙ Personal settings</span>,
            hash: 'personal-settings',
            component: <UserSettingsEditor />,
          },
        ]}
      />
    )
  },
})
