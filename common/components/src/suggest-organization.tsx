import { useAuthApi } from '@common/frontend-utils'
import { auth } from '@common/models'
import { createComponent, Shade } from '@furystack/shades'
import { Suggest } from '@furystack/shades-common-components'

export const SuggestOrganization = Shade<{
  prefix: string
  onSelectOrganization: (org: auth.Organization) => void
  exclude?: (org: auth.Organization) => boolean
}>({
  shadowDomName: 'shade-suggest-organization',
  render: ({ props, injector }) => {
    return (
      <Suggest<auth.Organization>
        defaultPrefix={props.prefix}
        onSelectSuggestion={(org) => {
          props.onSelectOrganization(org)
        }}
        getEntries={async (term) => {
          const { result: orgs } = await useAuthApi(injector)({
            method: 'GET',
            action: '/organizations',
            query: {
              findOptions: {
                top: 10,
                filter: { $or: [{ name: { $regex: term } }, { description: { $regex: term } }] },
              },
            },
          })
          return orgs.entries.filter((org) => !props.exclude || !props.exclude(org))
        }}
        getSuggestionEntry={(u) => ({
          score: 1,
          element: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', fontSize: '32px' }}>{u.icon}</div>

              <div style={{ marginLeft: '2em' }}>
                <strong>{u.name}</strong> <br />
                {u.description}
              </div>
            </div>
          ),
        })}
      />
    )
  },
})
