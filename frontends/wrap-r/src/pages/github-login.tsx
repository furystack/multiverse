/* eslint-disable @typescript-eslint/camelcase */
import { Button } from 'common-components'
import { Shade, createComponent, RouteLink } from '@furystack/shades'
import { Loader } from '../components/loader'
import { GithubAuthProvider } from '../services/github-auth-provider'
import { SessionService } from '../services/session'

export const GithubLogin = Shade<{ code: string }, { loginError?: string }>({
  shadowDomName: 'shade-github-login',
  initialState: {
    loginError: undefined,
  },
  constructed: async ({ props, injector, updateState }) => {
    const location = injector.getInstance(SessionService).currentUser.subscribe(() => {
      window.history.pushState('', '', '/')
    })
    try {
      await injector.getInstance(GithubAuthProvider).login(props.code)
    } catch (error) {
      updateState({ loginError: error.body.error })
    }
    return () => location.dispose()
  },
  render: ({ getState }) => {
    const { loginError } = getState()
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '32px',
        }}>
        {!loginError ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <Loader style={{ width: '128px', height: '128px', marginBottom: '32px' }} />
            Logging in with GitHub
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              animation: 'shake 150ms 2 linear',
            }}>
            <p>😱 There was an error during Github login: {loginError}</p>
            <RouteLink href="/">
              <Button style={{}}>Return Home</Button>{' '}
            </RouteLink>
          </div>
        )}
      </div>
    )
  },
})
