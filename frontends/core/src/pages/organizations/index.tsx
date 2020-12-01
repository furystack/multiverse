import { Shade, createComponent, LocationService } from '@furystack/shades'
import { AuthApiService } from '@common/frontend-utils'
import { auth } from '@common/models'
import { DataGrid, Fab, colors, CollectionService } from '@furystack/shades-common-components'

export const OrganizationsPage = Shade<{}, { service: CollectionService<auth.Organization> }>({
  shadowDomName: 'shade-organizations-page',
  getInitialState: ({ injector }) => {
    const service = new CollectionService<auth.Organization>(
      (findOptions) =>
        injector.getInstance(AuthApiService).call({
          method: 'GET',
          action: '/organizations',
          query: { findOptions },
        }),
      { top: 20, order: { name: 'ASC' } },
    )
    return { service }
  },
  render: ({ getState, injector }) => {
    return (
      <div style={{ background: 'rgba(128,128,128,0.03)', width: '100%', height: '100%' }}>
        <DataGrid<auth.Organization>
          columns={['name', 'description']}
          service={getState().service}
          headerComponents={{}}
          rowComponents={{}}
          styles={{}}
          onDoubleClick={(entry) => {
            history.pushState({}, '', `/organization/${encodeURIComponent(entry.name)}`)
            injector.getInstance(LocationService).updateState()
          }}
        />
        <Fab
          title="Create new organization"
          style={{ fontSize: '32px', background: colors.primary.main, color: colors.primary.contrastText }}
          onclick={() => {
            /** */
            history.pushState({}, '', '/add-organization')
            injector.getInstance(LocationService).updateState()
          }}>
          ➕
        </Fab>
      </div>
    )
  },
})
