import { Shade, createComponent, LocationService } from '@furystack/shades'
import { useDashboardApi } from '@common/frontend-utils'
import { Input, Button, NotyService } from '@furystack/shades-common-components'

export const CreateDashboard = Shade({
  shadowDomName: 'multiverse-create-dashboard',
  render: ({ injector, useState }) => {
    const [name, setName] = useState('name', '')
    const [description, setDescription] = useState('description', '')

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
                  name,
                  description,
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
          <Input name="dashboardName" value={name} labelTitle="Board Name" required onTextChange={setName} />
          <Input
            name="dashboardDescription"
            value={description}
            labelTitle="Description"
            required
            onTextChange={setDescription}
          />
          <Button type="submit">Create Dashboard</Button>
        </form>
      </div>
    )
  },
})
