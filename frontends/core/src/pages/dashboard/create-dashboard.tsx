import { Shade, createComponent } from '@furystack/shades'
import { dashboard } from '@common/models'
import { DashboardApiService } from '@common/frontend-utils'
import { Input, Button } from '@furystack/shades-common-components'

export const CreateDashboard = Shade<{}, Pick<dashboard.Dashboard, 'name' | 'description'>>({
  getInitialState: () => ({ name: '', description: '' }),
  shadowDomName: 'multiverse-create-dashboard',
  render: ({ injector, getState, updateState }) => {
    return (
      <div>
        <form
          onsubmit={async (ev) => {
            ev.preventDefault()
            const created = await injector.getInstance(DashboardApiService).call({
              method: 'POST',
              action: '/boards',
              body: {
                ...getState(),
              },
            })
            window.history.pushState('', '', `/dashboard/edit/${created._id}`)
          }}>
          <Input
            value={getState().name}
            labelTitle="Board Name"
            required
            onTextChange={(text) => updateState({ name: text }, true)}
          />
          <Input
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
