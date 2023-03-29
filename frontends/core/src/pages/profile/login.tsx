import { Shade, createComponent } from '@furystack/shades'
import { useAuthApi } from '@common/frontend-utils'
import { Button, colors } from '@furystack/shades-common-components'
import { ImageAvatar } from '@common/components'
import type { auth } from '@common/models'
import { GoogleOauthProvider } from '../../services/google-auth-provider'

export const ProfileLogin = Shade<{
  loginProviderDetails: {
    google?: auth.GoogleAccount | undefined
    github?: auth.GithubAccount | undefined
    hasPassword: boolean
  }
}>({
  shadowDomName: 'shade-multiverse-profile-login',
  render: ({ injector, props }) => {
    const { loginProviderDetails } = props
    return (
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
    )
  },
})
