import { createComponent, Shade, Router } from '@furystack/shades'
import { SessionService, sessionState } from '../services/session'
import { User } from '../odata/entity-types'
import { Init, WelcomePage, Offline, Login } from '../pages'
import { RegisterPage } from '../pages/register'
import { ResetPasswordPage } from '../pages/reset-password'
import { ProfilePage } from '../pages/profile'
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
      session.currentUser.subscribe(usr => updateState({ currentUser: usr })),
    ]
    return () => observables.forEach(o => o.dispose())
  },
  render: ({ getState }) => {
    return (
      <div
        style={{
          margin: '10px',
          padding: '10px',
          position: 'fixed',
          top: '40px',
          width: 'calc(100% - 40px)',
          height: 'calc(100% - 80px)',
          overflow: 'hidden',
        }}>
        {(() => {
          switch (getState().sessionState) {
            case 'authenticated':
              return getState().currentUser ? (
                <Router
                  routeMatcher={(current, component) => current.pathname === component}
                  notFound={() => <div>Route not found</div>}
                  routes={[
                    { url: '/profile', component: () => <ProfilePage /> },
                    { url: '/', component: () => <WelcomePage /> },
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
                  notFound={() => <div>Route not found</div>}
                  routes={[
                    { url: '/', component: () => <Login /> },
                    { url: '/register', component: () => <RegisterPage /> },
                    {
                      url: '/reset-password',
                      component: () => <ResetPasswordPage />,
                    },
                  ]}
                />
              )
            default:
              return <Init />
          }
        })()}
      </div>
    )
  },
})
