import { Shade, createComponent, LocationService, RouteLink } from '@furystack/shades'
import { CollectionService, DataGrid, Fab } from '@furystack/shades-common-components'
import type { dashboard } from '@common/models'
import { useDashboardApi } from '@common/frontend-utils'

export const DashboardList = Shade<{}, { service: CollectionService<dashboard.Dashboard> }>({
  shadowDomName: 'multiverse-dashboard-list',
  getInitialState: ({ injector }) => {
    return {
      service: new CollectionService<dashboard.Dashboard>({
        loader: async (findOptions) => {
          const { result } = await useDashboardApi(injector)({
            method: 'GET',
            action: '/boards',
            query: { findOptions },
          })
          return result
        },
        defaultSettings: { top: 20, order: { creationDate: 'DESC' } },
      }),
    }
  },
  render: ({ getState, injector }) => {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <DataGrid<dashboard.Dashboard>
          columns={['name', 'owner', 'creationDate']}
          service={getState().service}
          styles={{
            cell: {
              textAlign: 'center',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            },
            wrapper: { background: 'rgba(128,128,128,0.03)' },
          }}
          headerComponents={{}}
          rowComponents={{
            name: (el) => {
              return (
                <div>
                  <RouteLink href={`/dashboard/edit/${el._id}`}>{el.name}</RouteLink> <br /> {el.description}
                </div>
              )
            },
          }}
        />
        <Fab
          title="Create new dashboard"
          onclick={() => {
            window.history.pushState('', '', '/dashboard/new')
            injector.getInstance(LocationService).updateState()
          }}
        >
          ➕
        </Fab>
      </div>
    )
  },
})
