import { Shade, createComponent, LocationService } from '@furystack/shades'
import { CollectionService, DataGrid, styles } from '@furystack/shades-common-components'
import { diag } from '@common/models'
import { DiagApiService } from '@common/frontend-utils'

export const PatchList = Shade<{}, { service: CollectionService<diag.Patch> }>({
  shadowDomName: 'multiverse-patch-list',
  getInitialState: ({ injector }) => {
    return {
      service: new CollectionService<diag.Patch>(
        (findOptions) =>
          injector.getInstance(DiagApiService).call({
            method: 'GET',
            action: '/patches',
            query: { findOptions },
          }),
        { top: 20, order: { startDate: 'DESC' } },
      ),
    }
  },
  render: ({ getState, injector }) => {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <DataGrid<diag.Patch>
          columns={['appName', 'name', 'description', 'status', 'startDate']}
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
            window.history.pushState('', '', `/diags/patches/${entry._id}`)
            injector.getInstance(LocationService).updateState()
          }}
        />
      </div>
    )
  },
})
