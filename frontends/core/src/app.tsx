import { Injector } from '@furystack/inject'
import { SessionService, SessionState } from '@common/frontend-utils'
import { createComponent, LazyLoad, Router, Shade } from '@furystack/shades'
import { defaultLightTheme, NotyList, ThemeProviderService } from '@furystack/shades-common-components'
import { Init, Login } from './pages'
import { GenericErrorPage } from './pages/generic-error'

const lightBackground = 'linear-gradient(to right bottom, #ebebf8, #e3e3f6, #dcdcf4, #d4d4f2, #cdcdf0)'
const darkBackground = 'linear-gradient(to right bottom, #2b3036, #292c31, #27282d, #242428, #212023)'

const getStyles = (injector: Injector): Partial<CSSStyleDeclaration> => {
  const themeProvider = injector.getInstance(ThemeProviderService)
  const isLight = themeProvider.theme.getValue() === defaultLightTheme
  const backgroundImage = isLight ? lightBackground : darkBackground
  const color = themeProvider.getTextColor(themeProvider.theme.getValue().background.paper)
  return {
    backgroundImage,
    color,
  }
}

export const MultiverseApp = Shade<{}, { sessionState: SessionState }>({
  shadowDomName: 'furystack-multiverse-app',
  getInitialState: () => ({ sessionState: 'initializing' }),
  resources: ({ injector, updateState, element }) => {
    const sessionService = injector.getInstance(SessionService)
    return [
      sessionService.state.subscribe((sessionState) => updateState({ sessionState })),
      injector.getInstance(ThemeProviderService).theme.subscribe(() => {
        const styles = getStyles(injector)
        Object.assign((element.querySelector('div') as HTMLDivElement).style, styles)
      }, true),
    ]
  },
  render: ({ getState, injector }) => {
    const { sessionState } = getState()

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
          ...getStyles(injector),
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, Helvetica, sans-serif',
          lineHeight: '1.6',
        }}
        className="eee">
        {Component()}
        <NotyList />
      </div>
    )
  },
})
