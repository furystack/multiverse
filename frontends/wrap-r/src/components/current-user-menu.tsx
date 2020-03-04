import { Shade, createComponent, LocationService } from '@furystack/shades'
import { User } from 'common-models'
import { Avatar, Button } from 'common-components'
import { SessionService } from '../services/session'

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
            // background: 'rgba(255,0,0,0.5)',
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
              display: 'flex',
              flexDirection: 'column',
              // alignItems: 'center',
            }}>
            <Button
              title="Profile"
              onclick={() => injector.getInstance(LocationService).onLocationChanged.setValue(new URL('/profile'))}>
              Profile
            </Button>
            <Button title="logout" onclick={() => injector.getInstance(SessionService).logout()}>
              Log out
            </Button>
          </div>
          <div
            style={{
              position: 'fixed',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              zIndex: '1',
              background: 'rgba(128,128,128,0.2)',
            }}
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
