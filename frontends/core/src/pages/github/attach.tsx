/* eslint-disable @typescript-eslint/camelcase */
import { Button, Loader } from '@furystack/shades-common-components'
import { Shade, createComponent, RouteLink } from '@furystack/shades'
import { getErrorMessage } from '@common/frontend-utils'
import { GithubAuthProvider } from '../../services/github-auth-provider'

export const GithubAttach = Shade<{ code: string }, { loginError?: string }>({
  shadowDomName: 'shade-github-attach',
  getInitialState: () => ({
    loginError: undefined,
  }),
  constructed: async ({ props, injector, updateState }) => {
    try {
      await injector.getInstance(GithubAuthProvider).attach(props.code)
      history.pushState({}, '', '/profile#tab-1')
    } catch (error) {
      const loginError =
        (await getErrorMessage(error)) || 'There was an error during you have tried attaching the account.'
      updateState({
        loginError,
      })
    }
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
            Attaching Github Account
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
            <p> 😱 There was an error during Github account attach: {loginError}</p>
            <RouteLink href="/">
              <Button style={{}}>Return Home</Button>{' '}
            </RouteLink>
          </div>
        )}
      </div>
    )
  },
})
