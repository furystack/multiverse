import { auth } from '@common/models'
import { AuthApiService } from '@common/frontend-utils'
import { Shade, createComponent } from '@furystack/shades'
import { CommandPalette, CommandProvider } from '@furystack/shades-common-components'
import { Avatar } from './avatar'

const createMemberListCommandProvider: (
  members: auth.Profile[],
  onSelect: (user: auth.Profile) => void,
) => CommandProvider = (currentMembers, onSelect) => async ({ term, injector }) => {
  const users = await injector.getInstance(AuthApiService).call({
    method: 'GET',
    action: '/profiles',
    query: {
      findOptions: { top: 10, filter: { $or: [{ username: { $regex: term } }, { displayName: { $regex: term } }] } },
    },
  })
  return users.entries
    .filter((user) => currentMembers.every((current) => current.username !== user.username))
    .map((u) => ({
      onSelected: () => {
        onSelect(u as auth.Profile)
      },
      score: 1,
      element: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar avatarUrl={u.avatarUrl} userName={u.av} style={{ width: '48px', height: '48px' }} />
          <div style={{ marginLeft: '2em' }}>
            <strong>{u.displayName}</strong> <br />
            {u.username}
          </div>
        </div>
      ),
    }))
}

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

export interface MemberListState {
  users: auth.Profile[]
}

export const MemberList = Shade<MemberListProps, MemberListState>({
  shadowDomName: 'multiverse-member-list',
  getInitialState: ({ props }) => ({
    users: props.users,
  }),
  render: ({ props, getState, updateState }) => {
    return (
      <div>
        <div style={{}}>
          {getState().users.map((u) => (
            <div style={{ display: 'flex', alignItems: 'center', padding: '5px' }}>
              <Avatar
                avatarUrl={u.avatarUrl}
                userName={u.username}
                style={{ width: '32px', height: '32px', marginRight: '2em' }}
              />
              {u.displayName}
              {props.canEdit ? (
                <span
                  style={{ cursor: 'pointer', marginLeft: '1.5em' }}
                  title="Remove"
                  onclick={() => {
                    props.onRemoveMember(u)
                    updateState({ users: getState().users.filter((usr) => usr.username !== u.username) })
                  }}>
                  ❌
                </span>
              ) : null}
            </div>
          ))}
        </div>
        {props.canEdit ? (
          <CommandPalette
            defaultPrefix="+"
            commandProviders={[
              createMemberListCommandProvider(getState().users, (user) => {
                updateState({ users: [...getState().users, user] })
                props.onAddMember(user)
              }),
            ]}
          />
        ) : null}
      </div>
    )
  },
})
