import { Shade, createComponent, LocationService } from '@furystack/shades'
import { SessionService, getErrorMessage } from '@common/frontend-utils'
import { Loader } from '@furystack/shades-common-components'
import { GithubAuthProvider } from '../../services/github-auth-provider'
import { GenericErrorPage } from '../generic-error'

export const GithubRegister = Shade<{ code: string }, { loginError?: string }>({
  shadowDomName: 'shade-github-register',
  getInitialState: () => ({
    loginError: undefined,
  }),
  constructed: async ({ props, injector, updateState }) => {
    const location = injector.getInstance(SessionService).currentUser.subscribe(() => {
      window.history.pushState('', '', '/')
      injector.getInstance(LocationService).updateState()
    })
    try {
      await injector.getInstance(GithubAuthProvider).register(props.code)
    } catch (error) {
      const loginError = (await getErrorMessage(error)) || 'Failed to register.'
      updateState({ loginError })
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
        }}
      >
        {!loginError ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Loader style={{ width: '128px', height: '128px', marginBottom: '32px' }} />
            Registering account with GitHub
          </div>
        ) : (
          <GenericErrorPage subtitle="😱 There was an error during Github registration" error={loginError} />
        )}
      </div>
    )
  },
})
