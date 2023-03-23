import { Shade, createComponent, RouteLink } from '@furystack/shades'
import { CollectionService, DataGrid } from '@furystack/shades-common-components'
import type { diag } from '@common/models'
import { useDiagApi } from '@common/frontend-utils'

export const PatchList = Shade({
  shadowDomName: 'multiverse-patch-list',

  render: ({ useDisposable, injector }) => {
    const service = useDisposable(
      'service',
      () =>
        new CollectionService<diag.Patch>({
          loader: async (findOptions) => {
            const { result } = await useDiagApi(injector)({
              method: 'GET',
              action: '/patches',
              query: { findOptions },
            })
            return result
          },
          defaultSettings: { top: 20, order: { startDate: 'DESC' } },
        }),
    )
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <DataGrid<diag.Patch>
          columns={['appName', 'name', 'description', 'status', 'startDate']}
          service={service}
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
