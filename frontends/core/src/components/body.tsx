import { createComponent, Shade, Route, Router, LazyLoad } from '@furystack/shades'
import { auth } from '@common/models'
import { SessionService, SessionState, AuthApiService, MediaApiService } from '@common/frontend-utils'
import { Loader } from '@furystack/shades-common-components'
import { Init, WelcomePage } from '../pages'
import { Page404 } from '../pages/404'
import { GenericErrorPage } from '../pages/generic-error'
import { AcceptTermsPage } from '../pages/accept-terms'

export const Body = Shade<
  unknown,
  { sessionState: SessionState; currentUser: Omit<auth.User, 'password'> | null; isOperationInProgress: boolean }
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
  resources: ({ injector, updateState }) => {
    const session = injector.getInstance(SessionService)
    return [
      session.state.subscribe((newState) => {
        updateState({
          sessionState: newState,
        })
      }, true),
      session.currentUser.subscribe((currentUser) => updateState({ currentUser })),
      session.isOperationInProgress.subscribe((isOperationInProgress) => updateState({ isOperationInProgress })),
    ]
  },
  render: ({ getState, injector }) => {
    const { currentUser, sessionState, isOperationInProgress } = getState()

    if (isOperationInProgress)
      return (
        <div style={{ position: 'fixed', display: 'flex', width: '100%', height: '100%', placeContent: 'center' }}>
          <Init message="Authenticating..." />
        </div>
      )

    return (
      <div
        style={{
          position: 'fixed',
          top: '0',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}>
        <div
          style={{
            paddingTop: '80px',
            width: '100%',
            height: 'calc(100% - 80px)',
            overflow: 'auto',
          }}>
          {sessionState === 'authenticated' && currentUser ? (
            currentUser.roles.includes('terms-accepted') ? (
              <Router
                notFound={() => <Page404 />}
                routes={
                  [
                    {
                      url: '/profile',
                      component: () => (
                        <LazyLoad
                          error={(error, retry) => (
                            <GenericErrorPage
                              subtitle="Something bad happened during loading your profile"
                              error={error}
                              retry={retry}
                            />
                          )}
                          component={async () => {
                            const { ProfilePage } = await import(/* webpackChunkName: "profile" */ '../pages/profile')
                            const { result: loginProviderDetails } = await injector.getInstance(AuthApiService).call({
                              method: 'GET',
                              action: '/loginProviderDetails',
                            })
                            return <ProfilePage loginProviderDetails={loginProviderDetails} currentUser={currentUser} />
                          }}
                          loader={<Init message="Loading your Profile..." />}
                        />
                      ),
                    },
                    {
                      url: '/',
                      component: () => (
                        <LazyLoad
                          error={(error, retry) => (
                            <GenericErrorPage
                              retry={retry}
                              subtitle="Something bad happened during loading your profile"
                              error={error}
                            />
                          )}
                          component={async () => {
                            const { result: profile } = await injector.getInstance(AuthApiService).call({
                              method: 'GET',
                              action: '/profiles/:username',
                              url: { username: currentUser.username },
                            })
                            return <WelcomePage profile={profile} />
                          }}
                          loader={<Init message="Loading your Profile..." />}
                        />
                      ),
                    },
                    {
                      url: '/organizations',
                      component: () => (
                        <LazyLoad
                          error={(error, retry) => (
                            <GenericErrorPage
                              subtitle="Something bad happened during loading the Organizations"
                              error={error}
                              retry={retry}
                            />
                          )}
                          component={async () => {
                            const { OrganizationsPage } = await import(
                              /* webpackChunkName: "organizations" */ '../pages/organizations'
                            )
                            return <OrganizationsPage />
                          }}
                          loader={<Init message="Loading Organizations..." />}
                        />
                      ),
                    },
                    {
                      url: '/add-organization',
                      component: () => (
                        <LazyLoad
                          error={(error, retry) => (
                            <GenericErrorPage
                              subtitle="Something bad happened during loading the Add Organization page"
                              error={error}
                              retry={retry}
                            />
                          )}
                          component={async () => {
                            const { AddOrganizationPage } = await import(
                              /* webpackChunkName: "add-organization" */ '../pages/organizations/add-organization'
                            )
                            return <AddOrganizationPage />
                          }}
                          loader={<Init message="Loading Organizations..." />}
                        />
                      ),
                    },
                    {
                      url: '/organization/:organizationName',
                      component: ({ match }) => (
                        <LazyLoad
                          error={(error, retry) => (
                            <GenericErrorPage
                              subtitle="Something bad happened during loading the Organization Details page"
                              error={error}
                              retry={retry}
                            />
                          )}
                          component={async () => {
                            const { OrganizationDetailsPage } = await import(
                              /* webpackChunkName: "edit-organization" */ '../pages/organizations/organization-details'
                            )
                            const { result: org } = await injector.getInstance(AuthApiService).call({
                              method: 'GET',
                              action: '/organization/:organizationName',
                              url: { organizationName: match.params.organizationName },
                            })
                            return <OrganizationDetailsPage organization={org as auth.Organization} />
                          }}
                          loader={<Init message="Loading the Organization..." />}
                        />
                      ),
                    },

                    {
                      url: '/dashboard',
                      routingOptions: {
                        end: false,
                      },
                      component: () => (
                        <LazyLoad
                          error={(error, retry) => (
                            <GenericErrorPage
                              subtitle="Something bad happened during loading the system diagnostics"
                              error={error}
                              retry={retry}
                            />
                          )}
                          component={async () => {
                            const { DashboardsPage } = await import(
                              /* webpackChunkName: "dashboards" */ '../pages/dashboard'
                            )
                            return <DashboardsPage />
                          }}
                          loader={<Init message="Loading Dashboards..." />}
                        />
                      ),
                    },
                    ...(currentUser.roles.includes('sys-diags')
                      ? [
                          {
                            url: '/diags',
                            routingOptions: {
                              end: false,
                            },
                            component: () => (
                              <LazyLoad
                                error={(error, retry) => (
                                  <GenericErrorPage
                                    subtitle="Something bad happened during loading the system diagnostics"
                                    error={error}
                                    retry={retry}
                                  />
                                )}
                                component={async () => {
                                  const { DiagsPage } = await import(/* webpackChunkName: "diags" */ '../pages/diags')
                                  return <DiagsPage />
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
                                error={(error, retry) => (
                                  <GenericErrorPage
                                    subtitle="Something bad happened during loading the feature switches"
                                    error={error}
                                    retry={retry}
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
                    ...(currentUser.roles.includes('user-admin')
                      ? [
                          {
                            url: '/users',
                            routingOptions: {
                              end: false,
                            },
                            component: () => (
                              <LazyLoad
                                error={(error, retry) => (
                                  <GenericErrorPage
                                    subtitle="Something bad happened during loading the Users Page"
                                    error={error}
                                    retry={retry}
                                  />
                                )}
                                component={async () => {
                                  const { UsersPage } = await import(
                                    /* webpackChunkName: "feature-switches" */ '../pages/users'
                                  )
                                  return <UsersPage />
                                }}
                                loader={<Init message="Loading Users..." />}
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
                            error={(error, retry) => (
                              <GenericErrorPage
                                subtitle="Something bad happened during loading the Movies page"
                                error={error}
                                retry={retry}
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
                    {
                      url: '/series/:imdbId',
                      component: ({ match }) => (
                        <LazyLoad
                          error={(error, retry) => (
                            <GenericErrorPage
                              subtitle="Something bad happened during loading the Movies page"
                              error={error}
                              retry={retry}
                            />
                          )}
                          component={async () => {
                            const { SeriesPage } = await import(
                              /* webpackChunkName: "movies" */ '../pages/movies/series'
                            )
                            const mediaApi = injector.getInstance(MediaApiService)

                            const seriesResult = await mediaApi.call({
                              method: 'GET',
                              action: '/series',
                              query: {
                                findOptions: {
                                  filter: {
                                    imdbId: { $eq: match.params.imdbId },
                                  },
                                  top: 1,
                                },
                              },
                            })

                            if (seriesResult.result.entries.length !== 1) {
                              return <Page404 />
                            }

                            const movies = await mediaApi.call({
                              method: 'GET',
                              action: '/movies',
                              query: {
                                findOptions: {
                                  filter: {
                                    'metadata.seriesId': match.params.imdbId,
                                  } as any,
                                  select: ['_id', 'metadata'],
                                },
                              },
                            })

                            return <SeriesPage series={seriesResult.result.entries[0]} movies={movies.result.entries} />
                          }}
                          loader={<Init message="Loading Series..." />}
                        />
                      ),
                    },
                  ] as Array<Route<any>>
                }></Router>
            ) : (
              <AcceptTermsPage />
            )
          ) : (
            <Loader
              style={{
                position: 'fixed',
                animation: 'show 100ms linear',
                width: '128px',
                height: '128px',
                top: '16px',
              }}
            />
          )}
        </div>
      </div>
    )
  },
})
