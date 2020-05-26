import { Shade, createComponent } from '@furystack/shades'
import { Tabs, styles, Input } from '@furystack/shades-common-components'
import { Organization } from '@common/models'
import { AuthApiService, SessionService } from '@common/frontend-utils'

export const OrganizationDetailsPage = Shade<{ organizationId: string }, { loadedOrganization?: Organization }>({
  getInitialState: () => ({}),
  shadowDomName: 'shade-organization-details-page',
  constructed: async ({ injector, props, updateState }) => {
    const org = await injector.getInstance(AuthApiService).call({
      method: 'GET',
      action: '/organization/:organizationName',
      url: { organizationName: props.organizationId },
    })
    updateState({ loadedOrganization: org })
  },
  render: ({ getState, injector }) => {
    const { loadedOrganization } = getState()
    const currentUser = injector.getInstance(SessionService).currentUser.getValue()
    const canEdit =
      loadedOrganization &&
      currentUser &&
      (loadedOrganization.ownerName === currentUser.username ||
        loadedOrganization.adminNames.includes(currentUser.username))
    return (
      <Tabs
        style={{ ...styles.glassBox, height: '100%', padding: '3em' }}
        tabs={[
          {
            header: <div>General info</div>,
            component: (
              <div>
                <Input
                  type="text"
                  readOnly={!canEdit}
                  value={loadedOrganization?.name}
                  labelTitle="Organization name"
                />
                <textarea>{JSON.stringify(getState().loadedOrganization, undefined, 2)}</textarea>
              </div>
            ),
          },
          {
            header: <div>Admins</div>,
            component: <div>Admins content</div>,
          },
          {
            header: <div>Members</div>,
            component: <div>Members content</div>,
          },
        ]}
      />
    )
  },
})
