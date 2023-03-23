import { Button, Loader, Input } from '@furystack/shades-common-components'
import { Shade, createComponent, RouteLink } from '@furystack/shades'
import { useAuthApi, SessionService } from '@common/frontend-utils'
import { GoogleOauthProvider } from '../services/google-auth-provider'

export const Login = Shade({
  shadowDomName: 'shade-login',

  render: ({ injector, useState, useObservable }) => {
    const sessionService = injector.getInstance(SessionService)

    const [userName, setUserName] = useState('userName', '')
    const [password, setPassword] = useState('password', '')
    const [error, setError] = useObservable('error', sessionService.loginError)
    const [isOperationInProgress] = useObservable('isOperationInProgress', sessionService.isOperationInProgress)

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
              sessionService.login(userName, password)
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
              disabled={isOperationInProgress}
              placeholder="The user's login name"
              value={userName}
              onchange={(ev) => {
                setUserName((ev.target as HTMLInputElement).value)
              }}
              title="username"
              autofocus
              type="text"
            />
            <Input
              labelTitle="Password"
              required
              disabled={isOperationInProgress}
              placeholder="The password for the user"
              value={password}
              type="password"
              onchange={(ev) => {
                setPassword((ev.target as HTMLInputElement).value)
              }}
            />
            {error && <div>{error.toString()}</div> /** TODO: Check me */}
            <div
              style={{
                padding: '1em 0',
              }}
            >
              <Button
                style={{ width: '100%' }}
                disabled={isOperationInProgress}
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
                  {isOperationInProgress ? (
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
