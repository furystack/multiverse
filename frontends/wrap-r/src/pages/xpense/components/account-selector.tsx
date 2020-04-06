import { Shade, createComponent, LocationService } from '@furystack/shades'
import { Autocomplete, Button } from 'common-components'
import { xpense } from 'common-models'
import { XpenseApiService } from 'common-frontend-utils/src'

export const AccountSelector = Shade<
  { onSelectAccount?: (accountUrlFragment: string) => void },
  {
    selectedAccountName: string
    accounts: Array<{
      name: string
      ownerType: xpense.Account['ownerType']
      ownerName: xpense.Account['ownerName']
      current: xpense.Account['current']
    }>
    accountNames: string[]
  }
>({
  getInitialState: () => ({
    accounts: [],
    accountNames: [],
    selectedAccountName: ``,
  }),
  constructed: async ({ injector, updateState }) => {
    const accounts = await injector.getInstance(XpenseApiService).call({
      method: 'GET',
      action: '/availableAccounts',
    })
    updateState({
      accountNames: accounts.map((a) => `${a.ownerType}/${a.ownerName}/${a.name}`),
    })
  },
  render: ({ injector, updateState, getState, props }) => {
    const { accountNames, selectedAccountName } = getState()

    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Autocomplete
          strict
          inputProps={{
            name: 'account',
            labelTitle: 'Select account',
            placeholder: 'Start type to filter',
            value: selectedAccountName,
          }}
          suggestions={accountNames}
          onchange={(account) => {
            props.onSelectAccount && props.onSelectAccount(encodeURI(account))
            updateState({ selectedAccountName: account })
          }}
        />
        <Button
          title="Create new account"
          variant="secondary"
          onclick={() => {
            history.pushState({}, '', '/xpense/add-account')
            injector.getInstance(LocationService).updateState()
          }}>
          Create
        </Button>
      </div>
    )
  },
})
