import { Shade, createComponent, LocationService } from '@furystack/shades'
import { CollectionService, DataGrid, styles, Fab } from '@furystack/shades-common-components'
import { dashboard } from '@common/models'
import { DashboardApiService } from '@common/frontend-utils'

export const DashboardList = Shade<{}, { service: CollectionService<dashboard.Dashboard> }>({
  shadowDomName: 'multiverse-dashboard-list',
  getInitialState: ({ injector }) => {
    return {
      service: new CollectionService<dashboard.Dashboard>(
        (findOptions) =>
          injector.getInstance(DashboardApiService).call({
            method: 'GET',
            action: '/boards',
            query: { findOptions },
          }),
        { top: 20, order: { creationDate: 'DESC' } },
      ),
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
            wrapper: styles.glassBox,
          }}
          headerComponents={{}}
          rowComponents={{}}
          onDoubleClick={(entry) => {
            window.history.pushState('', '', `/dashboard/edit/${entry._id}`)
            injector.getInstance(LocationService).updateState()
          }}
        />
        <Fab
          title="Create new dashboard"
          onclick={() => {
            window.history.pushState('', '', '/dashboard/new')
          }}>
          ➕
        </Fab>
      </div>
    )
  },
})
