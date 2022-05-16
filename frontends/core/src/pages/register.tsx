import { Button, Input } from '@furystack/shades-common-components'
import { Shade, createComponent, LocationService } from '@furystack/shades'
import { AuthApiService, SessionService } from '@common/frontend-utils'
import { GoogleOauthProvider } from '../services/google-auth-provider'
import { GenericErrorPage } from './generic-error'

export const RegisterPage = Shade({
  shadowDomName: 'register-page',
  getInitialState: () => ({
    error: '' as unknown,
    email: '',
    password: '',
    confirmPassword: '',
    isOperationInProgress: false,
  }),
  render: ({ injector, getState, updateState }) => {
    const { error } = getState()
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {error ? (
          <GenericErrorPage
            mainTitle="Failed to sign up 😒"
            subtitle="Something went wrong during registration"
            error={error}
          />
        ) : (
          <div
            style={{
              background: 'rgba(128,128,128,0.03)',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              overflowX: 'auto',
              padding: '1em 40px 2em',
              marginTop: '1em',
            }}
          >
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
                  const { result: user } = await injector
                    .getInstance(AuthApiService)
                    .call({ method: 'POST', action: '/register', body: { email, password } })
                  if (user && user.username === email) {
                    window.history.pushState('', '', '/')
                    injector.getInstance(LocationService).updateState()
                    sessionService.currentUser.setValue(user)
                    sessionService.state.setValue('authenticated')
                  }
                } catch (e) {
                  updateState({ error: e, isOperationInProgress: false })
                }
              }}
            >
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
                  } catch (e) {
                    updateState({ error: e })
                  }
                }}
              >
                Google
              </Button>
              <Button
                style={{ margin: '0 .3em' }}
                onclick={async () => {
                  const { result: oauthData } = await injector.getInstance(AuthApiService).call({
                    method: 'GET',
                    action: '/oauth-data',
                  })
                  window.location.replace(
                    `https://github.com/login/oauth/authorize?client_id=${oauthData.githubClientId}&redirect_uri=${window.location.origin}/github-register`,
                  )
                }}
              >
                GitHub
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  },
})
