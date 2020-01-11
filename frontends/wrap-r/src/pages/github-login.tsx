/* eslint-disable @typescript-eslint/camelcase */
import { Shade, createComponent } from '@furystack/shades'
import { Loader } from '../components/loader'
import { GithubAuthProvider } from '../services/github-auth-provider'
import { SessionService } from '../services/session'

export const GithubLogin = Shade<{ code: string }, { loginError?: boolean }>({
  initialState: {
    loginError: undefined,
  },
  constructed: async ({ props, injector, updateState }) => {
    const location = injector.getInstance(SessionService).currentUser.subscribe(() => {
      window.history.pushState('', '', '/')
    })
    try {
      const user = await injector.getInstance(GithubAuthProvider).login(props.code)
      if (!user) {
        throw Error('')
      }
    } catch (error) {
      updateState({ loginError: true })
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
        }}>
        {!loginError ? (
          <Loader style={{ width: '256px', height: '265px' }} />
        ) : (
          <p>There was an error during logging in.</p>
        )}
      </div>
    )
  },
})
