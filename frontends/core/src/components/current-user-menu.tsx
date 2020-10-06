import { Shade, createComponent, LocationService } from '@furystack/shades'
import { ObservableValue } from '@furystack/utils'
import { auth, common, serviceList } from '@common/models'
import { MyAvatar } from '@common/components'
import { SessionService } from '@common/frontend-utils'
import { styles, promisifyAnimation } from '@furystack/shades-common-components'
import { Icon } from './icon'

const CurrentUserMenuItem = Shade<{ title: string; icon: common.Icon; onclick: () => void }>({
  shadowDomName: 'current-user-menu-item',
  render: ({ props }) => {
    return (
      <a
        onclick={props.onclick}
        style={{
          cursor: 'pointer',
          display: 'flex',
          placeContent: 'center',
          justifyContent: 'flex-start',
          margin: '3px',
        }}
        title={props.title}>
        <Icon
          icon={props.icon}
          elementProps={{
            style: { display: 'inline', width: '32px', height: '24px', fontSize: '20px', lineHeight: '24px' },
          }}
        />{' '}
        &nbsp; {props.title}
      </a>
    )
  },
})

export const CurrentUserMenu = Shade<{}, { currentUser?: auth.User; isOpened: ObservableValue<boolean> }>({
  shadowDomName: 'shade-current-user-menu',
  getInitialState: () => ({ currentUser: undefined, isOpened: new ObservableValue<boolean>(false) }),
  constructed: ({ injector, updateState, getState, element }) => {
    const observers = [
      injector.getInstance(SessionService).currentUser.subscribe((usr) => {
        updateState({ currentUser: usr || undefined })
      }, true),
      getState().isOpened.subscribe(async (isOpened) => {
        const menu = element.querySelector('.current-user-menu') as HTMLElement
        const backdrop = element.querySelector('.user-menu-backdrop') as HTMLElement
        const container = element.querySelector('.menu-container') as HTMLElement
        if (isOpened) {
          container.style.display = 'block'
          container.style.opacity = '1'
          menu.animate(
            [
              { transform: 'scale(0.5) translateY(-100%)', opacity: 0 },
              { transform: 'scale(1) translateY(0)', opacity: 1 },
            ],
            {
              duration: 300,
              easing: 'cubic-bezier(0.175, 0.885, 0.320, 1)',
              fill: 'forwards',
            },
          )
          backdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 300,
            easing: 'cubic-bezier(0.175, 0.885, 0.320, 1)',
            fill: 'forwards',
          })
        } else {
          const menuPromise = promisifyAnimation(
            menu,
            [
              { transform: 'scale(1) translateY(0)', opacity: 1 },
              { transform: 'scale(0.5) translateY(-100%)', opacity: 0 },
            ],
            {
              duration: 300,
              easing: 'cubic-bezier(0.175, 0.885, 0.320, 1)',
              fill: 'forwards',
            },
          )
          const backdropPromise = promisifyAnimation(backdrop, [{ opacity: 1 }, { opacity: 0 }], {
            duration: 300,
            easing: 'cubic-bezier(0.175, 0.885, 0.320, 1)',
            fill: 'forwards',
          })
          await Promise.all([menuPromise, backdropPromise])
          container.style.opacity = '0'
          container.style.display = 'none'
        }
      }),
    ]
    return () => observers.map((o) => o.dispose())
  },

  render: ({ getState, injector }) => {
    const { currentUser, isOpened } = getState()
    return currentUser ? (
      <div
        style={{ width: '48px', height: '48px' }}
        onclick={(ev) => {
          ev.preventDefault()
          isOpened.setValue(!isOpened.getValue())
        }}>
        <MyAvatar />
        <div
          className="menu-container"
          style={{
            display: isOpened.getValue() ? 'block' : 'none',
            opacity: isOpened.getValue() ? '1' : '0',
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
            {serviceList
              .filter((service) =>
                service.requiredRoles.every((requiredRole) => currentUser.roles.includes(requiredRole as any)),
              )
              .map((service) => (
                <CurrentUserMenuItem
                  icon={service.icon}
                  title={service.name}
                  onclick={() => {
                    history.pushState({}, service.name, service.url)
                    injector.getInstance(LocationService).updateState()
                  }}
                />
              ))}

            <hr style={{ boxShadow: '1px 1px 1px solid rgba(0,0,0,0.1)' }} />
            <CurrentUserMenuItem
              title="Log out"
              icon={'🚪'}
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
            }}
            onclick={async (ev) => {
              ev.stopPropagation()
              isOpened.setValue(false)
            }}></div>
        </div>
      </div>
    ) : (
      <div />
    )
  },
})
