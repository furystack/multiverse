import { Loader } from '@furystack/shades-common-components'
import { Shade, createComponent } from '@furystack/shades'
import { getErrorMessage, SessionService } from '@common/frontend-utils'
import { GithubAuthProvider } from '../../services/github-auth-provider'
import { GenericErrorPage } from '../generic-error'

export const GithubLogin = Shade<{ code: string }>({
  shadowDomName: 'shade-github-login',
  constructed: async ({ props, injector, useState }) => {
    const [, setLoginError] = useState<string | undefined>('loginError', undefined)

    const location = injector.getInstance(SessionService).currentUser.subscribe(() => {
      window.history.pushState('', '', '/')
    })
    try {
      await injector.getInstance(GithubAuthProvider).login(props.code)
    } catch (error) {
      const errorMsg = await getErrorMessage(error)
      setLoginError(errorMsg)
    }
    return () => location.dispose()
  },
  render: ({ useState }) => {
    const [loginError] = useState<string | undefined>('loginError', undefined)

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
            Logging in with GitHub
          </div>
        ) : (
          <GenericErrorPage subtitle="😱 There was an error during Github login" error={loginError} />
        )}
      </div>
    )
  },
})
