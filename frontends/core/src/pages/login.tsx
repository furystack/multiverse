import { colors, Button, Input, styles } from '@common/components'
import { Shade, createComponent, RouteLink } from '@furystack/shades'
import { SessionService, getErrorMessage } from '@common/frontend-utils'
import { tokens } from '@common/config'
import { Loader } from '../components/loader'
import { GoogleOauthProvider } from '../services/google-auth-provider'

export const Login = Shade<
  unknown,
  { username: string; password: string; error: string; isOperationInProgress: boolean }
>({
  shadowDomName: 'shade-login',
  getInitialState: ({ injector }) => {
    const sessionService = injector.getInstance(SessionService)
    return {
      username: '',
      password: '',
      error: sessionService.loginError.getValue(),
      isOperationInProgress: sessionService.isOperationInProgress.getValue(),
    }
  },
  constructed: ({ injector, updateState }) => {
    const sessionService = injector.getInstance(SessionService)
    const subscriptions = [
      sessionService.loginError.subscribe((error) => updateState({ error })),
      sessionService.isOperationInProgress.subscribe((isOperationInProgress) => updateState({ isOperationInProgress })),
    ]
    return () => subscriptions.map((s) => s.dispose())
  },
  render: ({ injector, getState, updateState }) => {
    const { error, username, password } = getState()
    const sessinService = injector.getInstance(SessionService)

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 100px',
        }}>
        <div>
          <form
            style={
              {
                ...styles.glassBox,
                padding: '10px 55px 30px',
              } as any
            }
            className="login-form"
            onsubmit={(ev) => {
              ev.preventDefault()
              const state = getState()
              sessinService.login(state.username, state.password)
            }}>
            <h2
              style={{
                fontWeight: 'lighter',
                textAlign: 'center',
              }}>
              It's good to see you!
            </h2>
            <Input
              labelTitle="Username"
              required
              disabled={getState().isOperationInProgress}
              placeholder="The user's login name"
              value={username}
              onchange={(ev) => {
                updateState(
                  {
                    username: (ev.target as HTMLInputElement).value,
                  },
                  true,
                )
              }}
              title="username"
              autofocus
              type="text"
            />
            <Input
              labelTitle="Password"
              required
              disabled={getState().isOperationInProgress}
              placeholder="The password for the user"
              value={password}
              type="password"
              onchange={(ev) => {
                updateState(
                  {
                    password: (ev.target as HTMLInputElement).value,
                  },
                  true,
                )
              }}
            />
            <div
              style={{
                padding: '1em 0',
              }}>
              {error ? (
                <div className="login-error" style={{ color: colors.error.main, fontSize: '12px' }}>
                  {error}
                </div>
              ) : (
                <div />
              )}
              <Button
                style={{ width: '100%' }}
                disabled={getState().isOperationInProgress}
                type="submit"
                variant="primary">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                  Login
                  {getState().isOperationInProgress ? (
                    <Loader
                      style={{
                        width: '12px',
                        height: '12px',
                        position: 'absolute',
                        top: '-2px',
                      }}
                    />
                  ) : null}
                </div>
              </Button>
            </div>
            <p style={{ fontSize: '10px', textAlign: 'center' }}>You can also log in with</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                type="button"
                title="Google"
                onclick={async () => {
                  try {
                    await injector.getInstance(GoogleOauthProvider).login()
                  } catch (e) {
                    const errorMessage = await getErrorMessage(e)
                    updateState({ error: errorMessage })
                  }
                }}>
                Google
              </Button>
              <Button
                onclick={(ev) => {
                  ev.preventDefault()
                  window.location.replace(
                    `https://github.com/login/oauth/authorize?client_id=${tokens.githubClientId}&redirect_uri=${window.location.origin}/github-login`,
                  )
                }}
                title="Github">
                GitHub
              </Button>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                fontSize: '10px',
                marginTop: '1em',
                textDecoration: 'underline',
              }}>
              <RouteLink href="/register">Sign up</RouteLink>
              <RouteLink href="/reset-password">Reset password</RouteLink>
              <RouteLink href="/contact">Contact</RouteLink>
              <RouteLink href="/docs">Docs</RouteLink>
            </div>
          </form>
        </div>
      </div>
    )
  },
})
