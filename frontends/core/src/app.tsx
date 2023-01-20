import type { SessionState } from '@common/frontend-utils'
import { SessionService, ThemeService } from '@common/frontend-utils'
import { createComponent, LazyLoad, Router, Shade } from '@furystack/shades'
import { NotyList, ThemeProviderService } from '@furystack/shades-common-components'
import { Init, Login } from './pages'
import { GenericErrorPage } from './pages/generic-error'

export const MultiverseApp = Shade<{}, { sessionState: SessionState }>({
  shadowDomName: 'furystack-multiverse-app',
  getInitialState: () => ({ sessionState: 'initializing' }),
  resources: ({ injector, updateState }) => {
    const sessionService = injector.getInstance(SessionService)
    return [sessionService.state.subscribe((sessionState) => updateState({ sessionState }))]
  },
  render: ({ getState, injector }) => {
    const { sessionState } = getState()

    const themeProvider = injector.getInstance(ThemeProviderService)
    const themeService = injector.getInstance(ThemeService)

    const Component = () => {
      switch (sessionState) {
        case 'offline':
          return (
            <LazyLoad
              error={(error, retry) => (
                <GenericErrorPage
                  subtitle="Something bad happened during loading the Github Login page"
                  error={error}
                  retry={retry}
                />
              )}
              component={async () => {
                const { Offline } = await import(/* webpackChunkName: "offline" */ './pages/offline')
                return <Offline />
              }}
              loader={<Init message="Loading Offline Page..." />}
            />
          )
        case 'authenticated':
          return (
            <LazyLoad
              error={(error, retry) => (
                <GenericErrorPage
                  subtitle="Something bad happened during loading the Github Login page"
                  error={error}
                  retry={retry}
                />
              )}
              component={async () => {
                const { Layout } = await import(/* webpackChunkName: "offline" */ './components/layout')
                return <Layout />
              }}
              loader={<Init message="Loading Layout..." />}
            />
          )
        case 'unauthenticated':
          return (
            <Router
              routes={[
                {
                  url: '/github-login',
                  component: () => (
                    <LazyLoad
                      error={(error, retry) => (
                        <GenericErrorPage
                          subtitle="Something bad happened during loading the Github Login page"
                          error={error}
                          retry={retry}
                        />
                      )}
                      component={async () => {
                        const { GithubLogin } = await import(
                          /* webpackChunkName: "github-login" */ './pages/github/login'
                        )
                        return <GithubLogin code={location.search.replace('?', '').split('=')[1]} />
                      }}
                      loader={<Init message="Loading Github Login..." />}
                    />
                  ),
                },
                {
                  url: '/github-register',
                  component: () => (
                    <LazyLoad
                      error={(error, retry) => (
                        <GenericErrorPage
                          subtitle="Something bad happened during loading the Github Registration page"
                          error={error}
                          retry={retry}
                        />
                      )}
                      component={async () => {
                        const { GithubRegister } = await import(
                          /* webpackChunkName: "github-register" */ './pages/github/register'
                        )
                        return <GithubRegister code={location.search.replace('?', '').split('=')[1]} />
                      }}
                      loader={<Init message="Loading Github Registration..." />}
                    />
                  ),
                },
                {
                  url: '/github-attach',
                  component: () => (
                    <LazyLoad
                      error={(error, retry) => (
                        <GenericErrorPage
                          subtitle="Something bad happened during loading the Github Attach page"
                          error={error}
                          retry={retry}
                        />
                      )}
                      component={async () => {
                        const { GithubAttach } = await import(
                          /* webpackChunkName: "github-register" */ './pages/github/attach'
                        )
                        return <GithubAttach code={location.search.replace('?', '').split('=')[1]} />
                      }}
                      loader={<Init message="Loading Github Attach..." />}
                    />
                  ),
                },
                {
                  url: '/register',
                  component: () => (
                    <LazyLoad
                      error={(error, retry) => (
                        <GenericErrorPage
                          subtitle="Something bad happened during loading the Register page"
                          error={error}
                          retry={retry}
                        />
                      )}
                      component={async () => {
                        const { RegisterPage } = await import(/* webpackChunkName: "register" */ './pages/register')
                        return <RegisterPage />
                      }}
                      loader={<Init message="Loading Registration Page..." />}
                    />
                  ),
                },
                {
                  url: '/reset-password',
                  component: () => (
                    <LazyLoad
                      error={(error, retry) => (
                        <GenericErrorPage
                          subtitle="Something bad happened during loading the Reset Password page"
                          error={error}
                          retry={retry}
                        />
                      )}
                      component={async () => {
                        const { ResetPasswordPage } = await import(
                          /* webpackChunkName: "reset-password" */ './pages/reset-password'
                        )
                        return <ResetPasswordPage />
                      }}
                      loader={<Init message="Loading Password Reset Page..." />}
                    />
                  ),
                },
              ]}
              notFound={() => <Login style={{ height: '100%' }} />}
            />
          )

        default:
          return <Init message="Loading Application" />
      }
    }

    return (
      <div
        id="Layout"
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, Helvetica, sans-serif',
          lineHeight: '1.6',
          background: themeService.getBackground(),
          color: themeProvider.theme.text.secondary,
        }}
        className="eee"
      >
        {Component()}
        <NotyList />
      </div>
    )
  },
})
