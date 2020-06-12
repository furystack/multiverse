import { createComponent, Shade, Route, Router, LazyLoad } from '@furystack/shades'
import { auth } from '@common/models'
import { SessionService, sessionState, AuthApiService } from '@common/frontend-utils'
import { promisifyAnimation, Loader } from '@furystack/shades-common-components'
import { Init, WelcomePage, Offline, Login } from '../pages'
import { Page404 } from '../pages/404'
import { GenericErrorPage } from '../pages/generic-error'

export const Body = Shade<
  unknown,
  { sessionState: sessionState; currentUser: auth.User | null; isOperationInProgress: boolean }
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
  render: ({ getState, injector }) => {
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
                            error={(error) => (
                              <GenericErrorPage
                                subtitle="Something bad happened during loading your profile"
                                error={error}
                              />
                            )}
                            component={async () => {
                              const { ProfilePage } = await import(/* webpackChunkName: "profile" */ '../pages/profile')
                              const profile = (await injector.getInstance(AuthApiService).call({
                                method: 'GET',
                                action: '/profiles/:username',
                                url: { username: currentUser.username },
                              })) as auth.Profile
                              const loginProviderDetails = await injector.getInstance(AuthApiService).call({
                                method: 'GET',
                                action: '/loginProviderDetails',
                              })
                              return (
                                <ProfilePage
                                  profile={profile}
                                  loginProviderDetails={loginProviderDetails}
                                  currentUser={currentUser}
                                />
                              )
                            }}
                            loader={<Init message="Loading your Profile..." />}
                          />
                        ),
                      },
                      {
                        url: '/',
                        component: () => (
                          <LazyLoad
                            error={(error) => (
                              <GenericErrorPage
                                subtitle="Something bad happened during loading your profile"
                                error={error}
                              />
                            )}
                            component={async () => {
                              const profile = (await injector.getInstance(AuthApiService).call({
                                method: 'GET',
                                action: '/profiles/:username',
                                url: { username: currentUser.username },
                              })) as auth.Profile
                              return <WelcomePage profile={profile} currentUser={currentUser} />
                            }}
                            loader={<Init message="Loading your Profile..." />}
                          />
                        ),
                      },
                      {
                        url: '/organizations',
                        component: () => (
                          <LazyLoad
                            error={(error) => (
                              <GenericErrorPage
                                subtitle="Something bad happened during loading the Organizations"
                                error={error}
                              />
                            )}
                            component={async () => {
                              const { OrganizationsPage } = await import(
                                /* webpackChunkName: "organizations" */ '../pages/organizations'
                              )
                              return <OrganizationsPage />
                            }}
                            loader={<Init message="Loading your Profile..." />}
                          />
                        ),
                      },
                      {
                        url: '/add-organization',
                        component: () => (
                          <LazyLoad
                            error={(error) => (
                              <GenericErrorPage
                                subtitle="Something bad happened during loading the Add Organization page"
                                error={error}
                              />
                            )}
                            component={async () => {
                              const { AddOrganizationPage } = await import(
                                /* webpackChunkName: "add-organization" */ '../pages/organizations/add-organization'
                              )
                              return <AddOrganizationPage />
                            }}
                            loader={<Init message="Loading your Profile..." />}
                          />
                        ),
                      },
                      {
                        url: '/organization/:organizationName',
                        component: ({ match }) => (
                          <LazyLoad
                            error={(error) => (
                              <GenericErrorPage
                                subtitle="Something bad happened during loading the Organization Details page"
                                error={error}
                              />
                            )}
                            component={async () => {
                              const { OrganizationDetailsPage } = await import(
                                /* webpackChunkName: "edit-organization" */ '../pages/organizations/organization-details'
                              )
                              return <OrganizationDetailsPage organizationId={match.params.organizationName} />
                            }}
                            loader={<Init message="Loading your Profile..." />}
                          />
                        ),
                      },
                      {
                        url: '/xpense/add-account',
                        component: () => (
                          <LazyLoad
                            error={(error) => (
                              <GenericErrorPage
                                subtitle="Something bad happened during loading the Add Account page"
                                error={error}
                              />
                            )}
                            component={async () => {
                              const { AddXpenseAccountPage } = await import(
                                /* webpackChunkName: "xpense-add-account" */ '../pages/xpense/add-account'
                              )
                              return <AddXpenseAccountPage />
                            }}
                            loader={<Init message="Loading your Profile..." />}
                          />
                        ),
                      },
                      {
                        url: '/xpense',
                        routingOptions: {
                          end: false,
                        },
                        component: ({ match }) => (
                          <LazyLoad
                            error={(error) => (
                              <GenericErrorPage subtitle="Something bad happened during loading Xpense" error={error} />
                            )}
                            component={async () => {
                              const { XpensePage } = await import(/* webpackChunkName: "xpense" */ '../pages/xpense')
                              return (
                                <XpensePage
                                  accountName={decodeURIComponent(match.params.accountName)}
                                  accountType={decodeURIComponent(match.params.type) as 'user' | 'organization'}
                                  accountOwner={decodeURIComponent(match.params.owner)}
                                />
                              )
                            }}
                            loader={<Init message="Loading your Profile..." />}
                          />
                        ),
                      },
                      ...(currentUser.roles.includes('sys-logs')
                        ? [
                            {
                              url: '/sys-logs',
                              component: () => (
                                <LazyLoad
                                  error={(error) => (
                                    <GenericErrorPage
                                      subtitle="Something bad happened during loading the system logs"
                                      error={error}
                                    />
                                  )}
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
                                  error={(error) => (
                                    <GenericErrorPage
                                      subtitle="Something bad happened during loading the log entry details"
                                      error={error}
                                    />
                                  )}
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
                                  error={(error) => (
                                    <GenericErrorPage
                                      subtitle="Something bad happened during loading the feature switches"
                                      error={error}
                                    />
                                  )}
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
                      {
                        url: '/movies',
                        routingOptions: { end: false },
                        component: () => {
                          return (
                            <LazyLoad
                              error={(error) => (
                                <GenericErrorPage
                                  subtitle="Something bad happened during loading the Movies page"
                                  error={error}
                                />
                              )}
                              component={async () => {
                                const { MoviesPage } = await import(/* webpackChunkName: "movies" */ '../pages/movies')
                                return <MoviesPage />
                              }}
                              loader={<Init message="Loading Movies..." />}
                            />
                          )
                        },
                      },
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
                          error={(error) => (
                            <GenericErrorPage
                              subtitle="Something bad happened during loading the Register page"
                              error={error}
                            />
                          )}
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
                          error={(error) => (
                            <GenericErrorPage
                              subtitle="Something bad happened during loading the Reset Password page"
                              error={error}
                            />
                          )}
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
