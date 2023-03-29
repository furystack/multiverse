import { Shade, createComponent, LocationService, RouteLink } from '@furystack/shades'
import { useAuthApi } from '@common/frontend-utils'
import type { auth } from '@common/models'
import { DataGrid, Fab, colors, CollectionService } from '@furystack/shades-common-components'

export const OrganizationsPage = Shade({
  shadowDomName: 'shade-organizations-page',

  render: ({ useDisposable, injector }) => {
    const service = useDisposable(
      'service',
      () =>
        new CollectionService<auth.Organization>({
          loader: async (findOptions) => {
            const { result } = await useAuthApi(injector)({
              method: 'GET',
              action: '/organizations',
              query: { findOptions },
            })
            return result
          },
          defaultSettings: { top: 20, order: { name: 'ASC' } },
        }),
    )

    return (
      <div style={{ background: 'rgba(128,128,128,0.03)', width: '100%', height: '100%' }}>
        <DataGrid<auth.Organization>
          columns={['name', 'description']}
          service={service}
          headerComponents={{}}
          rowComponents={{
            name: (el) => (
              <div>
                <RouteLink href={`/organization/${encodeURIComponent(el.name)}`}>{el.name}</RouteLink>
              </div>
            ),
          }}
          styles={{}}
        />
        <Fab
          title="Create new organization"
          style={{ fontSize: '32px', background: colors.primary.main, color: colors.primary.contrastText }}
          onclick={() => {
            /** */
            history.pushState({}, '', '/add-organization')
            injector.getInstance(LocationService).updateState()
          }}
        >
          ➕
        </Fab>
      </div>
    )
  },
})
