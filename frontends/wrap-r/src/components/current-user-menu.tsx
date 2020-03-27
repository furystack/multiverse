import { Shade, createComponent } from '@furystack/shades'
import { User } from 'common-models'
import { Avatar, styles } from 'common-components'
import { SessionService } from 'common-frontend-utils'

const CurrentUserMenuItem = Shade<{ title: string; onclick: () => void }>({
  shadowDomName: 'current-user-menu-item',
  render: ({ props }) => {
    return (
      <a onclick={props.onclick} style={{ cursor: 'pointer', display: 'block' }} title={props.title}>
        {props.title}
      </a>
    )
  },
})

export const CurrentUserMenu = Shade<{}, { currentUser?: User; isOpened: boolean }>({
  shadowDomName: 'shade-current-user-menu',
  getInitialState: () => ({ currentUser: undefined, isOpened: false }),
  constructed: ({ injector, updateState }) => {
    const observer = injector.getInstance(SessionService).currentUser.subscribe((usr) => {
      updateState({ currentUser: usr || undefined })
    }, true)
    return () => observer.dispose()
  },

  render: ({ getState, updateState, injector, element }) => {
    const { currentUser, isOpened } = getState()
    return currentUser ? (
      <div
        style={{ width: '48px', height: '48px' }}
        onclick={(ev) => {
          ev.preventDefault()
          updateState({ isOpened: !isOpened })
          // eslint-disable-next-line no-unused-expressions
          element?.querySelector('.current-user-menu')?.animate(
            [
              { transform: 'scale(0.5) translateY(-100%)', opacity: 0 },
              { transform: 'scale(1) translateY(0)', opacity: 1 },
            ],
            {
              duration: 300,
              easing: 'cubic-bezier(0.175, 0.885, 0.320, 1)',
            },
          )

          // eslint-disable-next-line no-unused-expressions
          element?.querySelector('.user-menu-backdrop')?.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 300,
            easing: 'cubic-bezier(0.175, 0.885, 0.320, 1)',
          })
        }}>
        <Avatar user={currentUser} />
        <div
          style={{
            display: isOpened ? 'block' : 'none',
            opacity: isOpened ? '1' : '0',
            position: 'absolute',
          }}>
          <div
            className="current-user-menu"
            style={{
              ...styles.glassBox,
              backdropFilter: 'blur(4px)brightness(.2)contrast(0.8)',
              position: 'relative',
              width: '192px',
              zIndex: '2',
              right: '174px',
              top: '14px',
              padding: '1em',
              textAlign: 'right',
              userSelect: 'none',
            }}>
            <CurrentUserMenuItem
              title="Profile"
              onclick={() => {
                history.pushState({}, 'Profile', '/profile')
              }}
            />
            {currentUser.roles.includes('feature-switch-admin') ? (
              <CurrentUserMenuItem
                title="Feature switches"
                onclick={() => history.pushState({}, 'Feature Switches', '/feature-switches')}
              />
            ) : null}
            {currentUser.roles.includes('sys-logs') ? (
              <CurrentUserMenuItem
                title="System Log"
                onclick={() => history.pushState({}, 'System Log', '/sys-logs')}
              />
            ) : null}

            <hr style={{ boxShadow: '1px 1px 1px solid rgba(0,0,0,0.1)' }} />
            <CurrentUserMenuItem
              title="Log out"
              onclick={() => {
                injector.getInstance(SessionService).logout()
                history.pushState({}, 'Home', '/')
              }}
            />
          </div>
          <div
            className="user-menu-backdrop"
            style={{
              position: 'fixed',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              zIndex: '1',
              backgroundColor: 'rgba(0,0,0,0.3)',
              // backdropFilter: 'blur(10000px)',
            }}
            onclick={async (ev) => {
              ev.stopPropagation()
              const hideMenu = new Promise((resolve) => {
                const animation = element?.querySelector('.current-user-menu')?.animate(
                  [
                    { transform: 'scale(1) translateY(0)', opacity: 1 },
                    { transform: 'scale(0.5) translateY(-100%)', opacity: 0 },
                  ],
                  {
                    duration: 300,
                    easing: 'cubic-bezier(0.175, 0.885, 0.320, 1)',
                  },
                )
                animation && (animation.onfinish = () => resolve())
              })

              const hideBackdrop = new Promise((resolve) => {
                const animation = element
                  ?.querySelector('.user-menu-backdrop')
                  ?.animate([{ opacity: 1 }, { opacity: 0 }], {
                    duration: 300,
                    easing: 'cubic-bezier(0.175, 0.885, 0.320, 1)',
                  })
                animation && (animation.onfinish = () => resolve())
              })

              await Promise.all([hideMenu, hideBackdrop])
              updateState({ isOpened: false })
            }}></div>
        </div>
      </div>
    ) : (
      <div />
    )
  },
})
