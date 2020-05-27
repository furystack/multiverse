import { Shade, createComponent } from '@furystack/shades'
import { DataGrid, CollectionService } from '@furystack/shades-common-components'
import { xpense } from '@common/models'
import { XpenseApiService } from '@common/frontend-utils'

export const AccountHistoryReplenishments = Shade<
  { account: xpense.Account },
  { service: CollectionService<xpense.Replenishment> }
>({
  getInitialState: ({ injector, props }) => ({
    service: new CollectionService<xpense.Replenishment>(
      (findOptions) =>
        injector.getInstance(XpenseApiService).call({
          method: 'GET',
          action: '/replenishments',
          query: {
            findOptions: { ...findOptions, filter: { ...findOptions.filter, accountId: props.account._id } as any },
          },
        }),
      { top: 20, order: { creationDate: 'DESC' } },
    ),
  }),
  shadowDomName: 'xpense-account-history-replenishment',
  render: ({ getState }) => {
    return (
      <DataGrid<xpense.Replenishment>
        columns={['comment', 'amount', 'creationDate', 'createdBy']}
        service={getState().service}
        headerComponents={{}}
        rowComponents={{ amount: ({ amount }) => <span>{amount.toString()}</span> }}
        styles={{}}
      />
    )
  },
})
