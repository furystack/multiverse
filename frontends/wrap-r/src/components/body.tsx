import { createComponent, Shade, Route, Router, LazyLoad } from '@furystack/shades'
import { User } from 'common-models'
import { SessionService, sessionState, promisifyAnimation } from 'common-frontend-utils'
import { Init, WelcomePage, Offline, Login } from '../pages'
import { Page404 } from '../pages/404'
import { Loader } from './loader'

export const Body = Shade<
  unknown,
  { sessionState: sessionState; currentUser: User | null; isOperationInProgress: boolean }
>({
  shadowDomName: 'shade-app-body',
  getInitialState: ({ injector }) => {
    const sessionService = injector.getInstance(SessionService)
    return {
      sessionState: sessionService.state.getValue(),
      currentUser: sessionService.currentUser.getValue(),
      isOperationInProgress: sessionService.isOperationInProgress.getValue(),
    }
  },
  constructed: async ({ injector, updateState, getState }) => {
    const session = injector.getInstance(SessionService)
    const observables = [
      session.state.subscribe((newState) => {
        if (newState !== getState().sessionState) {
          updateState({
            sessionState: newState,
          })
        }
      }, true),
      session.currentUser.subscribe((currentUser) => updateState({ currentUser })),
      session.isOperationInProgress.subscribe((isOperationInProgress) => updateState({ isOperationInProgress })),
    ]
    return () => observables.forEach((o) => o.dispose())
  },
  render: ({ getState }) => {
    // eslint-disable-next-line no-shadow
    const { currentUser, sessionState, isOperationInProgress } = getState()

    if (isOperationInProgress) return <Init message="Initializing app..." />

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
          switch (sessionState) {
            case 'authenticated':
              return currentUser ? (
                <Router
                  notFound={() => <Page404 />}
                  routes={
                    [
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
                            {
                              url: '/sys-logs/:logGuid',
                              component: ({ match }) => (
                                <LazyLoad
                                  component={async () => {
                                    const guid = match.params.logGuid
                                    const { EntryDetails } = await import(
                                      /* webpackChunkName: "system-logs" */ '../pages/system-logs/entry-details'
                                    )
                                    return <EntryDetails guid={guid} />
                                  }}
                                  loader={<Init message="Loading Logs Details page..." />}
                                />
                              ),
                            } as Route<{ logGuid: string }>,
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
                    ] as Array<Route<any>>
                  }></Router>
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
                  notFound={() => <Page404 />}
                  routes={[
                    {
                      url: '/',
                      component: () => <Login />,
                      onVisit: async ({ element }) => {
                        const form = element.querySelector('form')
                        form &&
                          (await promisifyAnimation(form, [{ opacity: '0' }, { opacity: '1' }], {
                            duration: 750,
                            easing: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
                          }))
                      },
                      onLeave: async ({ element }) => {
                        const form = element.querySelector('form')
                        form &&
                          (await promisifyAnimation(form, [{ opacity: '1' }, { opacity: '0' }], {
                            duration: 750,
                            easing: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
                          }))
                      },
                    },
                    {
                      url: '/register',
                      onVisit: async ({ element }) => {
                        const form = element.querySelector('form')
                        form &&
                          (await promisifyAnimation(form, [{ opacity: '0' }, { opacity: '1' }], {
                            duration: 750,
                            easing: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
                          }))
                      },
                      onLeave: async ({ element }) => {
                        const form = element.querySelector('form')
                        form &&
                          (await promisifyAnimation(form, [{ opacity: '1' }, { opacity: '0' }], {
                            duration: 750,
                            easing: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
                          }))
                      },
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
