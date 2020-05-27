import { Button, Input, styles, colors } from '@furystack/shades-common-components'
import { Shade, createComponent, LocationService } from '@furystack/shades'
import { AuthApiService, SessionService, getErrorMessage } from '@common/frontend-utils'
import { GoogleOauthProvider } from '../services/google-auth-provider'

export const RegisterPage = Shade({
  shadowDomName: 'register-page',
  getInitialState: () => ({ error: '', email: '', password: '', confirmPassword: '', isOperationInProgress: false }),
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
              ...styles.glassBox,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              animation: 'shake 150ms 2 linear',
              padding: '2em',
            }}>
            <h2>Failed to sign up :(</h2>
            <p style={{ color: colors.error.main }}>Something went wrong during registration: {getState().error}</p>
            <div>
              <Button onclick={() => updateState({ error: '' })}>Try again</Button> or&nbsp;
              <Button onclick={() => window.history.pushState('/', '', '/')}>Back to Home</Button>
            </div>
          </div>
        ) : (
          <div
            style={{
              ...styles.glassBox,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              overflowX: 'auto',
              padding: '1em 40px 2em',
              marginTop: '1em',
            }}>
            <h2>Sign up</h2>
            <p>By signing up with you accept the corporate blahblahblah...</p>

            <form
              onsubmit={async (ev) => {
                ev.preventDefault()
                const { email, password, confirmPassword } = getState()
                if (password !== confirmPassword) {
                  alert('Password and Confirm Password does not match :(')
                  return
                }
                const sessionService = injector.getInstance(SessionService)
                updateState({ isOperationInProgress: true })

                try {
                  const user = await injector
                    .getInstance(AuthApiService)
                    .call({ method: 'POST', action: '/register', body: { email, password } })
                  if (user && user.username === email) {
                    window.history.pushState('', '', '/')
                    injector.getInstance(LocationService).updateState()
                    sessionService.currentUser.setValue(user)
                    sessionService.state.setValue('authenticated')
                  }
                } catch (error) {
                  const errorMessage = (await getErrorMessage(error)) || 'Failed to register.'
                  updateState({ error: errorMessage })
                }
                updateState({ isOperationInProgress: false })
              }}>
              <Input
                type="email"
                labelTitle="E-mail"
                required
                autofocus
                value={getState().email}
                disabled={getState().isOperationInProgress}
                title="E-mail"
                onchange={(ev) => {
                  updateState({ email: (ev.target as HTMLInputElement).value }, true)
                }}
              />
              <Input
                type="password"
                value={getState().password}
                labelTitle="Password"
                title="Password"
                required
                disabled={getState().isOperationInProgress}
                onchange={(ev) => updateState({ password: (ev.target as HTMLInputElement).value }, true)}
              />
              <Input
                type="password"
                value={getState().confirmPassword}
                labelTitle="Confirm password"
                title="Confirm password"
                required
                disabled={getState().isOperationInProgress}
                onchange={(ev) => updateState({ confirmPassword: (ev.target as HTMLInputElement).value }, true)}
              />
              <Button title="Register" type="submit">
                Register
              </Button>
            </form>
            <p>You can also sign up using the following accounts:</p>
            <div>
              <Button
                style={{ margin: '0 .3em' }}
                onclick={async () => {
                  try {
                    await injector.getInstance(GoogleOauthProvider).signup()
                  } catch (error) {
                    const errorMessage = await getErrorMessage(error)
                    updateState({ error: errorMessage })
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
