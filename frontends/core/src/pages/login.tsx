import { Button, Loader, Input } from '@furystack/shades-common-components'
import { Shade, createComponent, RouteLink } from '@furystack/shades'
import { useAuthApi, SessionService } from '@common/frontend-utils'
import { GoogleOauthProvider } from '../services/google-auth-provider'

export const Login = Shade<
  unknown,
  { username: string; password: string; isOperationInProgress: boolean; error?: string }
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
  resources: ({ injector, updateState }) => {
    const sessionService = injector.getInstance(SessionService)
    return [
      sessionService.isOperationInProgress.subscribe((isOperationInProgress) => {
        updateState({ isOperationInProgress })
      }, true),
      sessionService.loginError.subscribe((error) => {
        updateState({ error })
      }, true),
    ]
  },
  render: ({ injector, getState, updateState }) => {
    const { username, password } = getState()
    const sessinService = injector.getInstance(SessionService)

    return (
      <div
        style={{
          position: 'fixed',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div>
          <form
            style={
              {
                background: 'rgba(128,128,128,0.03)',
                padding: '10px 55px 30px',
              } as any
            }
            className="login-form"
            onsubmit={(ev) => {
              ev.preventDefault()
              const state = getState()
              sessinService.login(state.username, state.password)
            }}
          >
            <h2
              style={{
                fontWeight: 'lighter',
                textAlign: 'center',
              }}
            >
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
              }}
            >
              <Button
                style={{ width: '100%' }}
                disabled={getState().isOperationInProgress}
                type="submit"
                variant="contained"
                color="primary"
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    width: '100%',
                  }}
                >
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
                  await injector.getInstance(GoogleOauthProvider).login()
                }}
              >
                Google
              </Button>
              <Button
                onclick={async (ev) => {
                  ev.preventDefault()
                  const { result: oauthData } = await useAuthApi(injector)({
                    method: 'GET',
                    action: '/oauth-data',
                  })
                  window.location.replace(
                    `https://github.com/login/oauth/authorize?client_id=${oauthData.githubClientId}&redirect_uri=${window.location.origin}/github-login`,
                  )
                }}
                type="button"
                title="Github"
              >
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
              }}
            >
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
