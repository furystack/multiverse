import { Shade, createComponent, LocationService } from '@furystack/shades'
import { Input, Button } from '@furystack/shades-common-components'
import { auth } from '@common/models'
import { AuthApiService, SessionService } from '@common/frontend-utils'
import { FullScreenForm } from '../../components/full-screen-form'

export const AddOrganizationPage = Shade<{}, Omit<auth.Organization, '_id'>>({
  getInitialState: ({ injector }) => ({
    adminNames: [],
    memberNames: [],
    description: '',
    name: '',
    owner: { type: 'user', username: injector.getInstance(SessionService).currentUser.getValue()?.username || '' },
    icon: '💳',
  }),
  shadowDomName: 'shade-add-organization-page',
  render: ({ getState, injector, updateState }) => {
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
              }}>
              Back
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Create organization
            </Button>
          </div>
        }
        onSubmit={async (ev) => {
          ev.preventDefault()
          const created = await injector.getInstance(AuthApiService).call({
            method: 'POST',
            action: '/organizations',
            body: {
              ...getState(),
            },
          })
          history.pushState({}, '', `/organization/${encodeURIComponent(created.name)}`)
        }}>
        <Input
          autofocus
          required
          type="text"
          labelTitle="Name"
          onTextChange={(value) => updateState({ name: value }, true)}
        />
        <Input required type="text" labelTitle="Icon" onTextChange={(value) => updateState({ icon: value }, true)} />
        <Input
          type="text"
          labelTitle="Description"
          onTextChange={(value) => updateState({ description: value }, true)}
        />
      </FullScreenForm>
    )
  },
})
