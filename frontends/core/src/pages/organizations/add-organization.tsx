import { Shade, createComponent, LocationService } from '@furystack/shades'
import { Input, Button, colors } from '@furystack/shades-common-components'
import { auth } from '@common/models'
import { AuthApiService, SessionService } from '@common/frontend-utils'

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
      <div style={{ background: 'rgba(128,128,128,0.03)', height: '100%', padding: '3em' }}>
        <form
          onsubmit={async (ev) => {
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
          <Input type="text" labelTitle="Name" onTextChange={(value) => updateState({ name: value }, true)} />
          <Input type="text" labelTitle="Icon" onTextChange={(value) => updateState({ icon: value }, true)} />
          <Input
            type="text"
            labelTitle="Description"
            onTextChange={(value) => updateState({ description: value }, true)}
          />
          <Button
            title="Back to Organization List"
            style={{ background: colors.secondary.main, color: colors.secondary.contrastText, marginRight: '2em' }}
            onclick={() => {
              /** */
              history.pushState({}, '', '/organizations')
              injector.getInstance(LocationService).updateState()
            }}>
            Back
          </Button>
          <Button type="submit" color="primary" variant="contained">
            Create organization
          </Button>
        </form>
      </div>
    )
  },
})
