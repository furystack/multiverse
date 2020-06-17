import { createComponent, Shade } from '@furystack/shades'
import { deepMerge } from '@furystack/utils'
import { Tabs, styles, Input, Button, colors } from '@furystack/shades-common-components'
import { auth } from '@common/models'
import { AuthApiService, MyAvatarService } from '@common/frontend-utils'
import { tokens } from '@common/config'
import { MyAvatar } from '@common/components'
import { v4 } from 'uuid'
import { GoogleOauthProvider } from '../services/google-auth-provider'
import { ChangePasswordForm } from '../components/change-password-form'
import { UserSettingsEditor } from '../components/editors/user-settings'

export const ProfilePage = Shade<
  {
    profile: auth.Profile
    loginProviderDetails: { hasPassword: boolean; google?: auth.GoogleAccount; github?: auth.GithubAccount }
    currentUser: auth.User
  },
  {
    profile: auth.Profile
    loginProviderDetails: { hasPassword: boolean; google?: auth.GoogleAccount; github?: auth.GithubAccount }
    currentUser: auth.User
  }
>({
  getInitialState: ({ props }) => ({ ...props }),
  render: ({ injector, getState }) => {
    const { currentUser, profile, loginProviderDetails } = getState()

    const uploadId = v4()

    const reloadProviderDetails = async () => {
      /** */
    }

    return (
      <Tabs
        style={{ ...styles.glassBox, height: '100%', padding: '1em' }}
        tabs={[
          {
            header: <div>🎴 General info</div>,
            component: (
              <div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div>
                    <form
                      onchange={async (ev) => {
                        const form = (ev.target as any).form as HTMLFormElement
                        if (form.checkValidity()) {
                          const file: File = (form.elements[0] as any).files[0]
                          injector.getInstance(MyAvatarService).uploadAvatar(file)
                        }
                      }}>
                      <label htmlFor={uploadId} style={{ cursor: 'pointer' }}>
                        <MyAvatar style={{ display: 'inline-block', width: '3em', height: '3em', cursor: 'pointer' }} />
                      </label>
                      <input
                        required
                        name="avatar"
                        id={uploadId}
                        type="file"
                        style={{ opacity: '0', position: 'absolute', zIndex: '-1' }}
                      />
                    </form>
                  </div>

                  <h3 style={{ marginLeft: '2em' }}>General Info</h3>
                </div>
                <Input type="text" labelTitle="Login name" value={currentUser.username} disabled />
                <Input type="text" labelTitle="Display name" value={profile.displayName} disabled />
                <Input type="text" labelTitle="Registration date" value={currentUser.registrationDate} disabled />
                <Input type="text" labelTitle="Roles" value={currentUser.roles.join(', ')} disabled />
              </div>
            ),
          },
          {
            header: <div> 🚪 Login</div>,
            component: (
              <div style={{ border: '1px solid #aaa', padding: '1em' }}>
                <div style={{ borderBottom: '1px solid #555', paddingBottom: '2em' }}>
                  <h4>Password login</h4>
                  {loginProviderDetails.hasPassword ? (
                    <div>
                      The password has been set up correctly. You can change your password{' '}
                      <a href="#tab-2" style={{ color: colors.primary.light }}>
                        here
                      </a>{' '}
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
                <div style={{ borderBottom: '1px solid #555', paddingBottom: '2em' }}>
                  <h4>Google</h4>
                  {loginProviderDetails.google ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {/* <Avatar
                        style={{ width: '48px', height: '48px' }}
                        // avatarUrl={loginProviderDetails.google.googleApiPayload.picture}
                        userName={}
                      /> */}
                      <div style={{ margin: '0 2em' }}>
                        Connected with <strong>{loginProviderDetails.google.googleApiPayload.email}</strong>
                      </div>
                      <Button
                        title="Disconnect"
                        style={{ color: '#772211' }}
                        onclick={async () => {
                          if (
                            confirm(
                              "Once disconnected, you won't be able to login with this Google account. Are you sure to disconnect?",
                            )
                          ) {
                            await injector
                              .getInstance(AuthApiService)
                              .call({ method: 'POST', action: '/detachGoogleAccount' })
                            await reloadProviderDetails()
                          }
                        }}>
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <div>
                      Account not connected &nbsp;
                      <Button
                        style={{ color: 'rgba(16,92,32)' }}
                        onclick={async () => {
                          /** */
                          const token = await injector.getInstance(GoogleOauthProvider).getToken()
                          await injector.getInstance(AuthApiService).call({
                            method: 'POST',
                            action: '/attachGoogleAccount',
                            body: { token },
                          })
                          await reloadProviderDetails()
                        }}>
                        Connect
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <h4>GitHub</h4>
                  {loginProviderDetails.github ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {/* <Avatar
                        style={{ width: '48px', height: '48px' }}
                        avatarUrl={loginProviderDetails.github.githubApiPayload.avatar_url}
                      /> */}
                      <div style={{ margin: '0 2em' }}>
                        Connected with account &nbsp;
                        <strong>
                          <a
                            href={loginProviderDetails.github.githubApiPayload.html_url}
                            target="_blank"
                            style={{ color: colors.secondary.main }}>
                            {loginProviderDetails.github.githubApiPayload.login}
                          </a>
                        </strong>
                      </div>
                      <Button
                        title="Disconnect"
                        style={{ color: '#772211' }}
                        onclick={async () => {
                          if (
                            confirm(
                              "Once disconnected, you won't be able to login with this Github account. Are you sure to disconnect?",
                            )
                          ) {
                            await injector
                              .getInstance(AuthApiService)
                              .call({ method: 'POST', action: '/detachGithubAccount' })
                            // await reloadProviderDetails()
                            /** */
                          }
                        }}>
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <div>
                      Account not connected &nbsp;
                      <Button
                        style={{ color: 'rgba(16,92,32)' }}
                        onclick={(ev) => {
                          ev.preventDefault()
                          window.location.replace(
                            `https://github.com/login/oauth/authorize?client_id=${tokens.githubClientId}&redirect_uri=${window.location.origin}/github-attach`,
                          )
                        }}>
                        Connect
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ),
          },
          {
            header: <div> 🔑 Change Password</div>,
            component: (
              <div>
                <ChangePasswordForm
                  showCurrentPassword={loginProviderDetails.hasPassword}
                  onUpdated={() => reloadProviderDetails()}
                />
              </div>
            ),
          },
          {
            header: <div>⚙ Personal settings</div>,
            component: (
              <UserSettingsEditor
                value={JSON.stringify({ ...deepMerge(auth.DefaultUserSettings, profile.userSettings) }, undefined, 2)}
                options={{
                  theme: 'vs-dark',
                  automaticLayout: true,
                }}
              />
            ),
          },
        ]}
      />
    )
  },
})
