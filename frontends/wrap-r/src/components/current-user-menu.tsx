import { Shade, createComponent } from '@furystack/shades'
import { User } from 'common-models'
import { Avatar } from 'common-components'
import { SessionService } from '../services/session'

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
  initialState: { currentUser: undefined, isOpened: false },
  constructed: ({ injector, updateState }) => {
    const observer = injector.getInstance(SessionService).currentUser.subscribe(usr => {
      updateState({ currentUser: usr || undefined })
    }, true)
    return () => observer.dispose()
  },

  render: ({ getState, updateState, injector }) => {
    const { currentUser, isOpened } = getState()
    return currentUser ? (
      <div
        style={{ width: '48px', height: '48px' }}
        onclick={ev => {
          ev.preventDefault()
          updateState({ isOpened: !isOpened })
        }}>
        <Avatar user={currentUser} />
        <div
          style={{
            display: isOpened ? 'block' : 'none',
            opacity: isOpened ? '1' : '0',
            position: 'absolute',
          }}>
          <div
            style={{
              position: 'relative',
              width: '192px',
              zIndex: '2',
              right: '174px',
              top: '14px',
              background: '#dedede',
              color: '#444',
              border: '1px solid #888',
              borderRadius: '3px',
              padding: '1em',
              textAlign: 'right',
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
            style={
              {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                zIndex: '1',
                // background: 'rgba(128,128,128,0.2)',
                backdropFilter: 'blur(3px)brightness(1.2)contrast(0.4)',
                animation: 'show 200ms cubic-bezier(0.455, 0.030, 0.515, 0.955)',
              } as any
            }
            onclick={ev => {
              ev.stopPropagation()
              updateState({ isOpened: false })
            }}></div>
        </div>
      </div>
    ) : (
      <div />
    )
  },
})
