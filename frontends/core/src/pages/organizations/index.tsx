import { Shade, createComponent, LocationService } from '@furystack/shades'
import { CollectionService, AuthApiService } from '@common/frontend-utils'
import { Organization } from '@common/models'
import { DataGrid, styles, Fab, colors } from '@common/components'

export const OrganizationsPage = Shade<{}, { service: CollectionService<Organization> }>({
  shadowDomName: 'shade-organizations-page',
  getInitialState: ({ injector }) => {
    const service = new CollectionService<Organization>(
      (findOptions) =>
        injector.getInstance(AuthApiService).call({
          method: 'GET',
          action: '/organizations',
          query: { findOptions },
        }),
      { top: 20, order: {} },
    )
    return { service }
  },
  render: ({ getState, injector }) => {
    return (
      <div style={{ ...styles.glassBox, width: '100%', height: '100%' }}>
        <DataGrid<Organization>
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
