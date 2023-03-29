import { Shade, createComponent, LocationService } from '@furystack/shades'
import { Input, Button } from '@furystack/shades-common-components'
import type { auth } from '@common/models'
import { SessionService, useAuthApi } from '@common/frontend-utils'
import { FullScreenForm } from '../../components/full-screen-form'

export const AddOrganizationPage = Shade({
  shadowDomName: 'shade-add-organization-page',
  render: ({ injector, useState }) => {
    const [newOrganization, setNewOrganization] = useState<Omit<auth.Organization, '_id'>>('newOrganization', {
      adminNames: [],
      memberNames: [],
      description: '',
      name: '',
      owner: { type: 'user', username: injector.getInstance(SessionService).currentUser.getValue()?.username || '' },
      icon: '💳',
    })
    return (
      <FullScreenForm
        title="Create new Organization"
        actions={
          <div>
            <Button
              variant="outlined"
              title="Back to Organization List"
              onclick={() => {
                history.pushState({}, '', '/organizations')
                injector.getInstance(LocationService).updateState()
              }}
            >
              Back
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Create organization
            </Button>
          </div>
        }
        onSubmit={async (ev) => {
          ev.preventDefault()
          const { result: created } = await useAuthApi(injector)({
            method: 'POST',
            action: '/organizations',
            body: {
              ...newOrganization,
            },
          })
          history.pushState({}, '', `/organization/${encodeURIComponent(created.name)}`)
        }}
      >
        <Input
          autofocus
          required
          type="text"
          labelTitle="Name"
          onTextChange={(value) => setNewOrganization({ ...newOrganization, name: value })}
        />
        <Input
          required
          type="text"
          labelTitle="Icon"
          onTextChange={(value) => setNewOrganization({ ...newOrganization, icon: value })}
        />
        <Input
          type="text"
          labelTitle="Description"
          onTextChange={(value) => setNewOrganization({ ...newOrganization, description: value })}
        />
      </FullScreenForm>
    )
  },
})
