import { Shade, createComponent, LocationService } from '@furystack/shades'
import { dashboard } from '@common/models'
import { useDashboardApi } from '@common/frontend-utils'
import { Input, Button, NotyService } from '@furystack/shades-common-components'

export const CreateDashboard = Shade<{}, Pick<dashboard.Dashboard, 'name' | 'description'>>({
  getInitialState: () => ({ name: '', description: '' }),
  shadowDomName: 'multiverse-create-dashboard',
  render: ({ injector, getState, updateState }) => {
    return (
      <div>
        <form
          onsubmit={async (ev) => {
            try {
              ev.preventDefault()
              const { result: created } = await useDashboardApi(injector)({
                method: 'POST',
                action: '/boards',
                body: {
                  ...getState(),
                },
              })
              window.history.pushState('', '', `/dashboard/edit/${created._id}`)
              injector.getInstance(LocationService).updateState()
              injector.getInstance(NotyService).addNoty({
                type: 'success',
                title: 'Success',
                body: 'The Dashboard has been created',
              })
            } catch (error) {
              injector.getInstance(NotyService).addNoty({
                type: 'error',
                title: 'Error',
                body: 'Failed to create Dashboard',
              })
            }
          }}
        >
          <Input
            name="dashboardName"
            value={getState().name}
            labelTitle="Board Name"
            required
            onTextChange={(text) => updateState({ name: text }, true)}
          />
          <Input
            name="dashboardDescription"
            value={getState().name}
            labelTitle="Description"
            required
            onTextChange={(text) => updateState({ description: text }, true)}
          />
          <Button type="submit">Create Dashboard</Button>
        </form>
      </div>
    )
  },
})
