import { createComponent, Shade } from '@furystack/shades'
import { Tabs, Input, Button, colors, NotyService, Paper } from '@furystack/shades-common-components'
import type { auth } from '@common/models'
import { getRandomString } from '@common/models'
import { useAuthApi, MyAvatarService, SessionService } from '@common/frontend-utils'
import { MyAvatar, ImageAvatar } from '@common/components'
import { GoogleOauthProvider } from '../services/google-auth-provider'
import { ChangePasswordForm } from '../components/change-password-form'
import { UserSettingsEditor } from '../components/editors/user-settings'

export const ProfilePage = Shade<{
  loginProviderDetails: { hasPassword: boolean; google?: auth.GoogleAccount; github?: auth.GithubAccount }
  currentUser: Omit<auth.User, 'password'>
}>({
  shadowDomName: 'shade-profile-page',
  render: ({ injector, useObservable, props, useState }) => {
    const [profile] = useObservable('profile', injector.getInstance(SessionService).currentProfile)

    const { currentUser, loginProviderDetails } = props

    const [description, setDescription] = useState('description', profile.description)
    const [displayName, setDisplayName] = useState('displayName', profile.displayName)

    const uploadId = getRandomString()

    const reloadProviderDetails = async () => {
      /** */
    }

    return (
      <Tabs
        style={{ padding: '1em 0' }}
        tabs={[
          {
            header: <div>🎴 General info</div>,
            hash: 'general',
            component: (
              <div style={{ margin: '1em' }}>
                <Paper>
                  <div style={{ display: 'flex', alignItems: 'center' }} className="profileHeader">
                    <div>
                      <form
                        onchange={async (ev) => {
                          const form = (ev.target as any).form as HTMLFormElement
                          if (form.checkValidity()) {
                            const file: File = (form.elements[0] as any).files[0]
                            try {
                              await injector.getInstance(MyAvatarService).uploadAvatar(file)
                              injector.getInstance(NotyService).addNoty({
                                type: 'success',
                                title: 'Success',
                                body: 'Your avatar has been updated',
                              })
                            } catch (error) {
                              injector.getInstance(NotyService).addNoty({
                                type: 'error',
                                title: 'Error',
                                body: 'Something went wrong during updating your avatar',
                              })
                            }
                          }
                        }}
                      >
                        <label className="uploadAvatar" htmlFor={uploadId} style={{ cursor: 'pointer' }}>
                          <MyAvatar
                            style={{ display: 'inline-block', width: '3em', height: '3em', cursor: 'pointer' }}
                          />
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

                    <h3 style={{ marginLeft: '2em' }}>{currentUser.username}</h3>
                  </div>
                  <form
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onsubmit={async (ev) => {
                      ev.preventDefault()
                      if (description !== profile.description || displayName !== profile.displayName) {
                        try {
                          await useAuthApi(injector)({
                            method: 'PATCH',
                            action: '/profiles/:id',
                            url: { id: profile._id },
                            body: { displayName, description },
                          })
                          injector.getInstance(NotyService).addNoty({
                            type: 'success',
                            title: 'Success',
                            body: 'Your personal details has been updated.',
                          })
                        } catch (error) {
                          injector.getInstance(NotyService).addNoty({
                            type: 'error',
                            title: 'Failed to save',
                            body: 'There was an error during saving your profile',
                          })
                        }
                      }
                    }}
                  >
                    <Input
                      onTextChange={setDisplayName}
                      type="text"
                      labelTitle="Display name"
                      value={profile.displayName}
                    />
                    <Input
                      type="text"
                      labelTitle="Short introduction"
                      value={profile.description}
                      onTextChange={setDescription}
                    />
                    <Button type="submit" variant="contained" style={{ alignSelf: 'flex-end' }}>
                      Save Changes
                    </Button>
                  </form>
                </Paper>
                <Input type="text" labelTitle="Registration date" value={currentUser.registrationDate} disabled />
                <Input type="text" labelTitle="Roles" value={currentUser.roles.join(', ')} disabled />
              </div>
            ),
          },
          {
            header: <div> 🚪 Login</div>,
            hash: 'login',
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
                      <ImageAvatar
                        style={{ width: '48px', height: '48px' }}
                        imageUrl={loginProviderDetails.google.googleApiPayload.picture}
                      />
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
                            await useAuthApi(injector)({ method: 'POST', action: '/detachGoogleAccount' })
                            await reloadProviderDetails()
                          }
                        }}
                      >
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
                          await useAuthApi(injector)({
                            method: 'POST',
                            action: '/attachGoogleAccount',
                            body: { token },
                          })
                          await reloadProviderDetails()
                        }}
                      >
                        Connect
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <h4>GitHub</h4>
                  {loginProviderDetails.github ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <ImageAvatar
                        style={{ width: '48px', height: '48px' }}
                        imageUrl={loginProviderDetails.github.githubApiPayload.avatar_url}
                      />
                      <div style={{ margin: '0 2em' }}>
                        Connected with account &nbsp;
                        <strong>
                          <a
                            href={loginProviderDetails.github.githubApiPayload.html_url}
                            target="_blank"
                            style={{ color: colors.secondary.main }}
                          >
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
                            await useAuthApi(injector)({ method: 'POST', action: '/detachGithubAccount' })
                            // await reloadProviderDetails()
                            /** */
                          }
                        }}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <div>
                      Account not connected &nbsp;
                      <Button
                        style={{ color: 'rgba(16,92,32)' }}
                        onclick={async (ev) => {
                          ev.preventDefault()
                          const { result: oauthData } = await useAuthApi(injector)({
                            method: 'GET',
                            action: '/oauth-data',
                          })
                          window.location.replace(
                            `https://github.com/login/oauth/authorize?client_id=${oauthData.githubClientId}&redirect_uri=${window.location.origin}/github-attach`,
                          )
                        }}
                      >
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
            hash: 'change-password',
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
            hash: 'personal-settings',
            component: <UserSettingsEditor profileId={profile._id} settings={profile.userSettings} />,
          },
        ]}
      />
    )
  },
})
