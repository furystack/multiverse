import { Shade, createComponent, LocationService } from '@furystack/shades'
import { DataGrid, CollectionService } from '@furystack/shades-common-components'
import { xpense } from '@common/models'
import { XpenseApiService } from '@common/frontend-utils'

export const AccountHistoryShoppings = Shade<
  { account: xpense.Account },
  { service: CollectionService<xpense.Shopping> }
>({
  getInitialState: ({ injector, props }) => ({
    service: new CollectionService<xpense.Shopping>(
      (findOptions) =>
        injector.getInstance(XpenseApiService).call({
          method: 'GET',
          action: '/shoppings',
          query: {
            findOptions: { ...findOptions, filter: { ...findOptions.filter, accountId: props.account._id } as any },
          },
        }),
      { top: 20, order: { creationDate: 'DESC' } },
    ),
  }),
  shadowDomName: 'xpense-account-history-shopping',
  render: ({ getState, injector }) => {
    return (
      <DataGrid<xpense.Shopping>
        columns={['shopName', 'sumAmount', 'creationDate', 'createdBy']}
        service={getState().service}
        headerComponents={{}}
        rowComponents={{ sumAmount: ({ sumAmount }) => <span>{sumAmount.toString()}</span> }}
        onDoubleClick={(entry) => {
          history.pushState({}, '', `/xpense/${entry.accountId}/shopping/${entry._id}`)
          injector.getInstance(LocationService).updateState()
        }}
        styles={{}}
      />
    )
  },
})
