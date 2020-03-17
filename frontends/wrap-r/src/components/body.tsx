import { createComponent, Shade, Router, LazyLoad } from '@furystack/shades'
import { User } from 'common-models'
import { SessionService, sessionState } from 'common-frontend-utils'
import { Init, WelcomePage, Offline, Login } from '../pages'
import { Page404 } from '../pages/404'
import { Loader } from './loader'

export const Body = Shade({
  shadowDomName: 'shade-app-body',
  initialState: {
    sessionState: 'initial' as sessionState,
    currentUser: null as User | null,
  },
  constructed: async ({ injector, updateState, getState }) => {
    const session = injector.getInstance(SessionService)
    const observables = [
      session.state.subscribe(newState => {
        if (newState !== getState().sessionState) {
          updateState({
            sessionState: newState,
          })
        }
      }, true),
      session.currentUser.subscribe(usr => updateState({ currentUser: usr }), true),
    ]
    return () => observables.forEach(o => o.dispose())
  },
  render: ({ getState }) => {
    const { currentUser } = getState()
    return (
      <div
        style={{
          margin: '10px',
          position: 'fixed',
          top: '64px',
          width: 'calc(100% - 40px)',
          height: 'calc(100% - 84px)',
          overflow: 'hidden',
        }}>
        {(() => {
          switch (getState().sessionState) {
            case 'authenticated':
              return currentUser ? (
                <Router
                  routeMatcher={(current, component) => current.pathname === component}
                  notFound={() => <Page404 />}
                  routes={[
                    {
                      url: '/profile',
                      component: () => (
                        <LazyLoad
                          component={async () => {
                            const { ProfilePage } = await import(/* webpackChunkName: "profile" */ '../pages/profile')
                            return <ProfilePage />
                          }}
                          loader={<Init message="Loading your Profile..." />}
                        />
                      ),
                    },
                    { url: '/', component: () => <WelcomePage /> },
                    ...(currentUser.roles.includes('sys-logs')
                      ? [
                          {
                            url: '/sys-logs',
                            component: () => (
                              <LazyLoad
                                component={async () => {
                                  const { SystemLogs } = await import(
                                    /* webpackChunkName: "system-logs" */ '../pages/system-logs'
                                  )
                                  return <SystemLogs />
                                }}
                                loader={<Init message="Loading Logs page..." />}
                              />
                            ),
                          },
                        ]
                      : []),
                    ...(currentUser.roles.includes('feature-switch-admin')
                      ? [
                          {
                            url: '/feature-switches',
                            component: () => (
                              <LazyLoad
                                component={async () => {
                                  const { FeatureSwitchesPage } = await import(
                                    /* webpackChunkName: "feature-switches" */ '../pages/feature-switches'
                                  )
                                  return <FeatureSwitchesPage />
                                }}
                                loader={<Init message="Loading feature switches..." />}
                              />
                            ),
                          },
                        ]
                      : []),
                  ]}></Router>
              ) : (
                <Loader
                  style={{ animation: 'show 100ms linear', width: '128px', height: '128px', marginTop: '16px' }}
                />
              )
            case 'offline':
              return <Offline />
            case 'unauthenticated':
              return (
                <Router
                  routeMatcher={(current, component) => current.pathname === component}
                  notFound={() => <Page404 />}
                  routes={[
                    { url: '/', component: () => <Login /> },
                    {
                      url: '/register',
                      component: () => (
                        <LazyLoad
                          component={async () => {
                            const { RegisterPage } = await import(
                              /* webpackChunkName: "register" */ '../pages/register'
                            )
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
                          component={async () => {
                            const { ResetPasswordPage } = await import(
                              /* webpackChunkName: "reset-password" */ '../pages/reset-password'
                            )
                            return <ResetPasswordPage />
                          }}
                          loader={<Init message="Loading Password Reset Page..." />}
                        />
                      ),
                    },
                  ]}
                />
              )
            default:
              return <Init message="Initializing app..." />
          }
        })()}
      </div>
    )
  },
})
