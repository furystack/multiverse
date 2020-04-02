import { Shade, createComponent } from '@furystack/shades'
import { CollectionService, WrapRApiService } from 'common-frontend-utils/src'
import { Organization } from 'common-models/src'
import { DataGrid, styles } from 'common-components/src'

export const OrganizationsPage = Shade<{}, { service: CollectionService<Organization> }>({
  shadowDomName: 'shade-organizations-page',
  getInitialState: ({ injector }) => {
    const service = new CollectionService<Organization>(
      (filter) =>
        injector.getInstance(WrapRApiService).call({
          method: 'GET',
          action: '/organizations',
          query: { top: filter.top, skip: filter.skip },
        }),
      { top: 20, order: {} },
    )
    return { service }
  },
  render: ({ getState }) => {
    return (
      <div style={{ ...styles.glassBox, width: '100%', height: '100%' }}>
        <DataGrid<Organization>
          columns={['name', 'description']}
          service={getState().service}
          headerComponents={{}}
          rowComponents={{}}
          styles={{}}
          onDoubleClick={(entry) => history.pushState({}, '', `/organizations/${encodeURIComponent(entry.name)}`)}
        />
      </div>
    )
  },
})
