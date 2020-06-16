import { Shade, createComponent, LazyLoad } from '@furystack/shades'
import { Tabs, styles, Input } from '@furystack/shades-common-components'
import { auth } from '@common/models'
import { AuthApiService, SessionService } from '@common/frontend-utils'
import { MemberList } from '@common/components'
import { Init } from '../init'
import { GenericErrorPage } from '../generic-error'

export const OrganizationDetailsPage = Shade<{ organization: auth.Organization }>({
  shadowDomName: 'shade-organization-details-page',
  render: ({ injector, props }) => {
    const { organization } = props
    const currentUser = injector.getInstance(SessionService).currentUser.getValue()
    const canEdit =
      organization &&
      currentUser &&
      (organization.ownerName === currentUser.username || organization.adminNames.includes(currentUser.username))
        ? true
        : false
    return (
      <Tabs
        style={{ ...styles.glassBox, height: '100%', padding: '3em' }}
        tabs={[
          {
            header: <div>General info</div>,
            component: (
              <div>
                <Input type="text" readOnly={!canEdit} value={organization?.name} labelTitle="Organization name" />
                <textarea>{JSON.stringify(organization, undefined, 2)}</textarea>
              </div>
            ),
          },
          {
            header: <div>Admins</div>,
            component: (
              <LazyLoad
                loader={<Init message="Loading Admins..." />}
                component={async () => {
                  const users = await injector.getInstance(AuthApiService).call({
                    method: 'GET',
                    action: '/profiles',
                    query: { findOptions: { filter: { username: { $in: [...props.organization.adminNames] } } } },
                  })
                  return (
                    <MemberList
                      addLabel="Add another Admin"
                      users={users.entries as auth.Profile[]}
                      canEdit={canEdit}
                      onAddMember={(member) => {
                        injector.getInstance(AuthApiService).call({
                          method: 'POST',
                          action: '/organization/:organizationName/addAdmin',
                          url: { organizationName: props.organization.name },
                          body: { username: member.username },
                        })
                      }}
                      onRemoveMember={(member) => {
                        injector.getInstance(AuthApiService).call({
                          method: 'POST',
                          action: '/organization/:organizationName/removeAdmin',
                          url: { organizationName: props.organization.name },
                          body: { username: member.username },
                        })
                      }}
                    />
                  )
                }}
                error={(error, retry) => (
                  <GenericErrorPage subtitle="Failed to load the Admins" error={error} retry={retry} />
                )}
              />
            ),
          },
          {
            header: <div>Members</div>,
            component: (
              <LazyLoad
                loader={<Init message="Loading Members..." />}
                component={async () => {
                  const users = await injector.getInstance(AuthApiService).call({
                    method: 'GET',
                    action: '/profiles',
                    query: { findOptions: { filter: { username: { $in: [...props.organization.memberNames] } } } },
                  })
                  return (
                    <MemberList
                      addLabel="Add another Member"
                      users={users.entries as auth.Profile[]}
                      canEdit={canEdit}
                      onAddMember={(member) => {
                        injector.getInstance(AuthApiService).call({
                          method: 'POST',
                          action: '/organization/:organizationName/addMember',
                          url: { organizationName: props.organization.name },
                          body: { username: member.username },
                        })
                      }}
                      onRemoveMember={(member) => {
                        injector.getInstance(AuthApiService).call({
                          method: 'POST',
                          action: '/organization/:organizationName/removeMember',
                          url: { organizationName: props.organization.name },
                          body: { username: member.username },
                        })
                      }}
                    />
                  )
                }}
                error={(error, retry) => (
                  <GenericErrorPage subtitle="Failed to load the Admins" error={error} retry={retry} />
                )}
              />
            ),
          },
        ]}
      />
    )
  },
})
