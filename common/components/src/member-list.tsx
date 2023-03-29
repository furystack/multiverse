import type { auth } from '@common/models'
import { Shade, createComponent } from '@furystack/shades'
import { Avatar } from './avatar'
import { SuggestUser } from './suggest-user'

export type MemberListProps = { users: auth.Profile[]; addLabel: string } & (
  | {
      canEdit: false
    }
  | {
      canEdit: true
      onAddMember: (user: auth.Profile) => void
      onRemoveMember: (user: auth.Profile) => void
    }
)

export const MemberList = Shade<MemberListProps>({
  shadowDomName: 'multiverse-member-list',
  render: ({ props, useState }) => {
    const [users, setUsers] = useState('users', props.users)

    return (
      <div style={{ display: 'flex', background: 'rgba(128,128,128,0.2)', flexWrap: 'wrap', position: 'relative' }}>
        {users.map((u) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              margin: '4px',
              fontSize: '12px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(0,0,0,0.3)',
              borderRadius: '25px',
              boxShadow: '1px 3px 3px rgba(0,0,0,0.1)',
            }}
          >
            <Avatar
              userName={u.username}
              style={{ width: '28px', height: '28px', marginRight: '0.4em', lineHeight: '100%' }}
            />
            {u.displayName}
            {props.canEdit ? (
              <span
                style={{ cursor: 'pointer', margin: '0.4em' }}
                title="Remove"
                onclick={() => {
                  props.onRemoveMember(u)
                  setUsers(users.filter((usr) => usr.username !== u.username))
                }}
              >
                ❌
              </span>
            ) : null}
          </div>
        ))}
        {props.canEdit ? (
          <SuggestUser
            style={{
              overflow: 'visible',
              flexGrow: '1',
            }}
            prefix=""
            onSelectUser={(user) => {
              props.onAddMember(user)
              setUsers([...users, user])
            }}
            exclude={(user) => (users.find((usr) => usr.username === user.username) ? true : false)}
          />
        ) : null}
      </div>
    )
  },
})
