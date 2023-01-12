import { Shade, createComponent, LazyLoad } from '@furystack/shades'
import { Tabs, Input, Paper, NotyService } from '@furystack/shades-common-components'
import type { auth } from '@common/models'
import { useAuthApi, SessionService } from '@common/frontend-utils'
import { MemberList } from '@common/components'
import { Init } from '../init'
import { GenericErrorPage } from '../generic-error'
import { TransferOwnership } from '../../components/transfer-ownership'

export const OrganizationDetailsPage = Shade<{ organization: auth.Organization }>({
  shadowDomName: 'shade-organization-details-page',
  render: ({ injector, props }) => {
    const { organization } = props
    const currentUser = injector.getInstance(SessionService).currentUser.getValue()
    const canEdit =
      organization &&
      currentUser &&
      ((organization.owner.type === 'user' && organization.owner.username === currentUser.username) ||
        organization.adminNames.includes(currentUser.username))
        ? true
        : false
    return (
      <Paper
        elevation={3}
        style={{
          maxHeight: 'calc(100% - 100px)',
          margin: '0.5em 2em',
        }}
      >
        <Tabs
          tabs={[
            {
              header: <div>General info</div>,
              component: (
                <div style={{ padding: '2em' }}>
                  <Input type="text" readOnly={!canEdit} value={organization?.name} labelTitle="Name" />
                  <Input type="text" readOnly={!canEdit} value={organization?.description} labelTitle="Description" />
                  <h3>Admins</h3>
                  <LazyLoad
                    loader={<Init message="Loading Admins..." />}
                    component={async () => {
                      const { result: users } = await useAuthApi(injector)({
                        method: 'GET',
                        action: '/profiles',
                        query: { findOptions: { filter: { username: { $in: [...props.organization.adminNames] } } } },
                      })
                      return (
                        <MemberList
                          addLabel="Add another Admin"
                          users={users.entries as auth.Profile[]}
                          canEdit={canEdit}
                          onAddMember={async (member) => {
                            try {
                              await useAuthApi(injector)({
                                method: 'POST',
                                action: '/organization/:organizationName/addAdmin',
                                url: { organizationName: props.organization.name },
                                body: { username: member.username },
                              })
                              injector.getInstance(NotyService).addNoty({
                                type: 'success',
                                title: 'Success',
                                body: `User '${member.username}' added as Admin`,
                              })
                            } catch (error) {
                              injector.getInstance(NotyService).addNoty({
                                type: 'error',
                                title: 'Error',
                                body: `Failed to add admin '${member.username}'`,
                              })
                            }
                          }}
                          onRemoveMember={async (member) => {
                            try {
                              await useAuthApi(injector)({
                                method: 'POST',
                                action: '/organization/:organizationName/removeAdmin',
                                url: { organizationName: props.organization.name },
                                body: { username: member.username },
                              })
                              injector.getInstance(NotyService).addNoty({
                                type: 'success',
                                title: 'Success',
                                body: `User '${member.username}' removed from Admins`,
                              })
                            } catch (error) {
                              injector.getInstance(NotyService).addNoty({
                                type: 'error',
                                title: 'Error',
                                body: `Failed to remove admin '${member.username}'`,
                              })
                            }
                          }}
                        />
                      )
                    }}
                    error={(error, retry) => (
                      <GenericErrorPage subtitle="Failed to load the Admins" error={error} retry={retry} />
                    )}
                  />
                  <h3>Members</h3>
                  <LazyLoad
                    loader={<Init message="Loading Members..." />}
                    component={async () => {
                      const { result: users } = await useAuthApi(injector)({
                        method: 'GET',
                        action: '/profiles',
                        query: { findOptions: { filter: { username: { $in: [...props.organization.memberNames] } } } },
                      })
                      return (
                        <MemberList
                          addLabel="Add another Member"
                          users={users.entries as auth.Profile[]}
                          canEdit={canEdit}
                          onAddMember={async (member) => {
                            try {
                              await useAuthApi(injector)({
                                method: 'POST',
                                action: '/organization/:organizationName/addMember',
                                url: { organizationName: props.organization.name },
                                body: { username: member.username },
                              })
                              injector.getInstance(NotyService).addNoty({
                                type: 'success',
                                title: 'Success',
                                body: `User '${member.username}' added as Member`,
                              })
                            } catch (error) {
                              injector.getInstance(NotyService).addNoty({
                                type: 'error',
                                title: 'Error',
                                body: `Failed to add member '${member.username}'`,
                              })
                            }
                          }}
                          onRemoveMember={async (member) => {
                            try {
                              await useAuthApi(injector)({
                                method: 'POST',
                                action: '/organization/:organizationName/removeMember',
                                url: { organizationName: props.organization.name },
                                body: { username: member.username },
                              })
                              injector.getInstance(NotyService).addNoty({
                                type: 'success',
                                title: 'Success',
                                body: `User '${member.username}' removed from the member list`,
                              })
                            } catch (error) {
                              injector.getInstance(NotyService).addNoty({
                                type: 'error',
                                title: 'Error',
                                body: `Failed to remove member '${member.username}'`,
                              })
                            }
                          }}
                        />
                      )
                    }}
                    error={(error, retry) => (
                      <GenericErrorPage subtitle="Failed to load the Admins" error={error} retry={retry} />
                    )}
                  />
                </div>
              ),
            },

            {
              header: <div>Transfer Ownership</div>,
              component: (
                <div>
                  <TransferOwnership
                    name={organization.name}
                    currentOwner={organization.owner}
                    onTransfer={async (newOwner) => {
                      await useAuthApi(injector)({
                        method: 'PATCH',
                        action: '/organizations/:organizationName',
                        url: {
                          organizationName: organization.name,
                        },
                        body: {
                          owner: newOwner,
                        },
                      })
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Paper>
    )
  },
})
