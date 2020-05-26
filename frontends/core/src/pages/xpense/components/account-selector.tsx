import { Shade, createComponent, LocationService } from '@furystack/shades'
import { Autocomplete, Button } from '@common/components'
import { xpense } from '@common/models'
import { AvailableAccountsContext } from '../services/available-accounts-context'

export const AccountSelector = Shade<
  { currentAccount?: xpense.Account; onSelectAccount?: (accountUrlFragment: string) => void },
  {
    selectedAccountName?: string
    accountNames: string[]
  }
>({
  getInitialState: ({ props }) => ({
    accounts: [],
    accountNames: [],
    selectedAccountName: props.currentAccount
      ? `${props.currentAccount.ownerType}/${props.currentAccount.ownerName}/${props.currentAccount.name}`
      : '',
  }),
  constructed: async ({ injector, updateState }) => {
    const disposable = injector.getInstance(AvailableAccountsContext).accounts.subscribe((accounts) =>
      updateState(
        {
          accountNames: accounts.map((a) => `${a.ownerType}/${a.ownerName}/${a.name}`),
        },
        true,
      ),
    )
    return () => disposable.dispose()
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
