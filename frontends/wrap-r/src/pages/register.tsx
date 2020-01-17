import { Shade, createComponent } from '@furystack/shades'
import { Button } from 'common-components/src'
import { GoogleOauthProvider } from '../services/google-auth-provider'

export const RegisterPage = Shade({
  initialState: { error: '' },
  render: ({ injector, getState, updateState }) => {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
        {getState().error ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              animation: 'shake 150ms 2 linear',
            }}>
            <h2>Failed to sign up :(</h2>
            <p style={{ color: 'red' }}>Something went wrong during registration: {getState().error}</p>
            <div>
              <Button onclick={() => updateState({ error: '' })}>Try again</Button> or&nbsp;
              <Button onclick={() => window.history.pushState('/', '', '/')}>Back to Home</Button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <h2>Sign up</h2>
            <p>By signing up with the available account types here, you accepts the corporate blahblahblah...</p>
            <div>
              <Button
                style={{ margin: '0 .3em' }}
                onclick={async () => {
                  try {
                    await injector.getInstance(GoogleOauthProvider).signup()
                  } catch (error) {
                    updateState({ error: error.body.error })
                  }
                }}>
                Google
              </Button>
              <Button
                style={{ margin: '0 .3em' }}
                onclick={() => {
                  window.location.replace(
                    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${window.location.origin}/github-register`,
                  )
                }}>
                GitHub
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  },
})
