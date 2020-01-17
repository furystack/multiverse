import { Shade, createComponent } from '@furystack/shades'
import { User } from 'common-service-utils'
import { Avatar } from 'common-components'
import { SessionService } from '../services/session'

export const CurrentUserMenu = Shade<{}, { currentUser?: User }>({
  shadowDomName: 'shade-current-user-menu',
  initialState: { currentUser: undefined },
  constructed: ({ injector, updateState }) => {
    const observer = injector.getInstance(SessionService).currentUser.subscribe(usr => {
      updateState({ currentUser: usr || undefined })
    }, true)
    return () => observer.dispose()
  },

  render: ({ getState }) => {
    const { currentUser } = getState()
    return currentUser ? (
      <div style={{ width: '48px', height: '48px' }}>
        <Avatar user={currentUser} />
      </div>
    ) : (
      <div />
    )
  },
})
