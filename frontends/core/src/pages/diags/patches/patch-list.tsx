import { Shade, createComponent, RouteLink } from '@furystack/shades'
import { CollectionService, DataGrid } from '@furystack/shades-common-components'
import { diag } from '@common/models'
import { useDiagApi } from '@common/frontend-utils'

export const PatchList = Shade<{}, { service: CollectionService<diag.Patch> }>({
  shadowDomName: 'multiverse-patch-list',
  getInitialState: ({ injector }) => {
    return {
      service: new CollectionService<diag.Patch>(
        async (findOptions) => {
          const { result } = await useDiagApi(injector)({
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
  render: ({ getState }) => {
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
          rowComponents={{
            name: (el) => <RouteLink href={`/diags/patches/${el._id}`}>{el.name}</RouteLink>,
          }}
        />
      </div>
    )
  },
})
