import { AuthApiService } from '@common/frontend-utils'
import { auth } from '@common/models'
import { createComponent, Shade } from '@furystack/shades'
import { Suggest } from '@furystack/shades-common-components'
import { Avatar } from './avatar'

export const SuggestUser = Shade<{
  style?: Partial<CSSStyleDeclaration>
  prefix: string
  onSelectUser: (usr: auth.Profile) => void
  exclude?: (usr: auth.Profile) => boolean
}>({
  shadowDomName: 'shade-suggest-user',
  render: ({ props, injector }) => {
    return (
      <Suggest<auth.Profile>
        defaultPrefix={props.prefix}
        onSelectSuggestion={(user) => {
          props.onSelectUser(user)
        }}
        getEntries={async (term) => {
          const { result: users } = await injector.getInstance(AuthApiService).call({
            method: 'GET',
            action: '/profiles',
            query: {
              findOptions: {
                top: 10,
                filter: { $or: [{ username: { $regex: term } }, { displayName: { $regex: term } }] },
              },
            },
          })
          return users.entries.filter((usr) => !props.exclude || !props.exclude(usr))
        }}
        getSuggestionEntry={(u) => ({
          score: 1,
          element: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar userName={u.username} style={{ width: '48px', height: '48px' }} />
              <div style={{ marginLeft: '2em' }}>
                <strong>{u.displayName}</strong> <br />
                {u.username}
              </div>
            </div>
          ),
        })}
      />
    )
  },
})
