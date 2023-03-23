import { Button, Input } from '@furystack/shades-common-components'
import { Shade, createComponent, LocationService } from '@furystack/shades'
import { useAuthApi, SessionService } from '@common/frontend-utils'
import { GoogleOauthProvider } from '../services/google-auth-provider'
import { GenericErrorPage } from './generic-error'

export const RegisterPage = Shade({
  shadowDomName: 'register-page',

  render: ({ injector, useState }) => {
    const [error, setError] = useState<unknown>('error', '')
    const [email, setEmail] = useState('email', '')
    const [password, setPassword] = useState('password', '')
    const [confirmPassword, setConfirmPassword] = useState('confirmPassword', '')
    const [isOperationInProgress, setIsOperationInProgress] = useState('isOperationInProgress', false)

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
                if (password !== confirmPassword) {
                  alert('Password and Confirm Password does not match :(')
                  return
                }
                const sessionService = injector.getInstance(SessionService)
                setIsOperationInProgress(true)

                try {
                  const { result: user } = await useAuthApi(injector)({
                    method: 'POST',
                    action: '/register',
                    body: { email, password },
                  })
                  if (user && user.username === email) {
                    window.history.pushState('', '', '/')
                    injector.getInstance(LocationService).updateState()
                    sessionService.currentUser.setValue(user)
                    sessionService.state.setValue('authenticated')
                  }
                } catch (e) {
                  setError(e)
                  setIsOperationInProgress(false)
                }
              }}
            >
              <Input
                type="email"
                labelTitle="E-mail"
                required
                autofocus
                value={email}
                disabled={isOperationInProgress}
                title="E-mail"
                onTextChange={setEmail}
              />
              <Input
                type="password"
                value={password}
                labelTitle="Password"
                title="Password"
                required
                disabled={isOperationInProgress}
                onTextChange={setPassword}
              />
              <Input
                type="password"
                value={confirmPassword}
                labelTitle="Confirm password"
                title="Confirm password"
                required
                disabled={isOperationInProgress}
                onTextChange={setConfirmPassword}
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
                    setError(e)
                  }
                }}
              >
                Google
              </Button>
              <Button
                style={{ margin: '0 .3em' }}
                onclick={async () => {
                  const { result: oauthData } = await useAuthApi(injector)({
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
