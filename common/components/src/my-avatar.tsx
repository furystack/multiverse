import type { PartialElement } from '@furystack/shades'
import { Shade, createComponent } from '@furystack/shades'
import { SessionService, MyAvatarService } from '@common/frontend-utils'
import { Avatar } from './avatar'

export const MyAvatar = Shade<PartialElement<HTMLDivElement>>({
  shadowDomName: 'multiverse-my-avatar',
  resources: ({ useState, injector }) => {
    const [, setUpdateDate] = useState('updateDate', 0)
    const observable = injector
      .getInstance(MyAvatarService)
      .lastUpdate.subscribe((lastUpdateDate) => setUpdateDate(lastUpdateDate.valueOf()))
    return [observable]
  },
  render: ({ injector, useState, props }) => {
    const [updateDate] = useState('updateDate', 0)

    const username = injector.getInstance(SessionService).currentUser.getValue()?.username
    if (username) {
      return <Avatar userName={username} query={`updated=${updateDate}`} {...props} />
    }
    return <div />
  },
})
