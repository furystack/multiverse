import { Button, Form, Input } from '@furystack/shades-common-components'
import { Shade, createComponent, LocationService } from '@furystack/shades'
import { useAuthApi, SessionService } from '@common/frontend-utils'
import { GoogleOauthProvider } from '../services/google-auth-provider'
import { GenericErrorPage } from './generic-error'

type FormPayload = {
  email: string
  password: string
  confirmPassword: string
}
export const RegisterPage = Shade({
  shadowDomName: 'register-page',
  render: ({ injector, useState }) => {
    const [error, setError] = useState<unknown>('error', '')
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

            <Form<FormPayload>
              validate={(formData): formData is FormPayload => {
                return (
                  formData.email?.length &&
                  formData.password?.length &&
                  formData.confirmPassword?.length &&
                  formData.password === formData.confirmPassword
                )
              }}
              onSubmit={async ({ email, password }) => {
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
                name="email"
                labelTitle="E-mail"
                required
                autofocus
                disabled={isOperationInProgress}
                title="E-mail"
                getHelperText={() => "We'll never share your email with anyone else."}
              />
              <Input
                type="password"
                name="password"
                labelTitle="Password"
                title="Password"
                required
                disabled={isOperationInProgress}
                getHelperText={() => 'Password must be at least 8 characters long.'}
              />
              <Input
                type="password"
                name="confirmPassword"
                labelTitle="Confirm password"
                title="Confirm password"
                required
                disabled={isOperationInProgress}
                getHelperText={() => 'Please confirm your password.'}
                getValidationResult={({ state }) => {
                  const pwValue = (
                    state.element?.parentElement?.querySelector('input[name=password]') as HTMLInputElement
                  )?.value
                  return pwValue && pwValue !== state.value
                    ? { isValid: false, message: 'Passwords do not match' }
                    : { isValid: true }
                }}
              />
              <button type="submit" style={{ display: 'none' }} />
              <Button title="Register" type="submit">
                Register
              </Button>
            </Form>
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
