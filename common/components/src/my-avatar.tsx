import type { PartialElement } from '@furystack/shades'
import { Shade, createComponent } from '@furystack/shades'
import { SessionService, MyAvatarService } from '@common/frontend-utils'
import { Avatar } from './avatar'

export const MyAvatar = Shade<PartialElement<HTMLDivElement>, { lastUpdateDate: Date }>({
  getInitialState: ({ injector }) => ({ lastUpdateDate: injector.getInstance(MyAvatarService).lastUpdate.getValue() }),
  shadowDomName: 'multiverse-my-avatar',
  constructed: ({ injector, updateState }) => {
    const observable = injector
      .getInstance(MyAvatarService)
      .lastUpdate.subscribe((lastUpdateDate) => updateState({ lastUpdateDate }))
    return () => observable.dispose()
  },
  render: ({ injector, props, getState }) => {
    const username = injector.getInstance(SessionService).currentUser.getValue()?.username
    if (username) {
      return <Avatar userName={username} query={`updated=${getState().lastUpdateDate.toISOString()}`} {...props} />
    }
    return <div />
  },
})
