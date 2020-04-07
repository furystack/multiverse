import { Shade, createComponent, LocationService } from '@furystack/shades'
import { styles, Input, Button, colors } from 'common-components'
import { Organization } from 'common-models'
import { WrapRApiService } from 'common-frontend-utils'

export const AddOrganizationPage = Shade<{}, Omit<Organization, '_id'>>({
  getInitialState: () => ({ adminNames: [], memberNames: [], description: '', name: '', ownerName: '', icon: '💳' }),
  shadowDomName: 'shade-add-organization-page',
  render: ({ getState, injector, updateState }) => {
    return (
      <div style={{ ...styles.glassBox, height: '100%', padding: '3em' }}>
        <form
          onsubmit={async (ev) => {
            ev.preventDefault()
            const created = await injector.getInstance(WrapRApiService).call({
              method: 'POST',
              action: '/organizations',
              body: getState(),
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
          <Button type="submit" variant="primary">
            Create organization
          </Button>
        </form>
      </div>
    )
  },
})
