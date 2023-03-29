import { Loader } from '@furystack/shades-common-components'
import { Shade, createComponent } from '@furystack/shades'
import { getErrorMessage } from '@common/frontend-utils'
import { GithubAuthProvider } from '../../services/github-auth-provider'
import { GenericErrorPage } from '../generic-error'

export const GithubAttach = Shade<{ code: string }>({
  shadowDomName: 'shade-github-attach',

  constructed: async ({ props, injector, useState }) => {
    const [, setLoginError] = useState<string | undefined>('loginError', undefined)

    try {
      await injector.getInstance(GithubAuthProvider).attach(props.code)
      history.pushState({}, '', '/profile#tab-1')
    } catch (error) {
      const errorMsg =
        (await getErrorMessage(error)) || 'There was an error during you have tried attaching the account.'
      setLoginError(errorMsg)
    }
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
            Attaching Github Account
          </div>
        ) : (
          <GenericErrorPage subtitle="😱 There was an error during Github account attach" error={loginError} />
        )}
      </div>
    )
  },
})
