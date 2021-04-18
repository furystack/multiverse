import { Shade, createComponent, LocationService } from '@furystack/shades'
import { CollectionService, DataGrid } from '@furystack/shades-common-components'
import { diag } from '@common/models'
import { DiagApiService } from '@common/frontend-utils'

export const PatchList = Shade<{}, { service: CollectionService<diag.Patch> }>({
  shadowDomName: 'multiverse-patch-list',
  getInitialState: ({ injector }) => {
    return {
      service: new CollectionService<diag.Patch>(
        async (findOptions) => {
          const { result } = await injector.getInstance(DiagApiService).call({
            method: 'GET',
            action: '/patches',
            query: { findOptions },
          })
          return result
        },
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
            wrapper: { background: 'rgba(128,128,128,0.03)' },
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
