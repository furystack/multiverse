import { Shade, createComponent, LocationService } from '@furystack/shades'
import { XpenseApiService } from 'common-frontend-utils'
import { xpense } from 'common-models'
import { Button, Autocomplete } from 'common-components'

export const XpensePage = Shade<
  {},
  {
    accounts: Array<{ name: string; ownerType: xpense.Account['ownerType']; ownerName: xpense.Account['ownerName'] }>
  }
>({
  getInitialState: () => ({ accounts: [] }),
  constructed: async ({ injector, updateState }) => {
    const accounts = await injector.getInstance(XpenseApiService).call({
      method: 'GET',
      action: '/availableAccounts',
    })
    updateState({ accounts })
  },
  render: ({ getState, injector }) => {
    const { accounts } = getState()
    return (
      <div>
        xpense
        <br />
        <Autocomplete inputProps={{ name: 'account' }} suggestions={accounts.map((a) => a.name)} />
        {/*<Input list={accountSelectorId} labelTitle="Select account" />
        <datalist id={accountSelectorId}>
          {accounts.map((ac) => (
            <option value={ac.name} />
          ))}
        </datalist> */}
        {/* <AutoComplete<typeof accounts[number]>
          getSuggestions={async (term) => accounts.filter((a) => a.name.toLowerCase().includes(term.toLowerCase()))}
          renderSuggestion={(suggestion) => <div>{suggestion.name}</div>}
          onSelectSuggestion={(s) => console.log(s)}
          stringifySuggestion={(s) => s.name}
        /> */}
        <Button
          title="Create new account"
          variant="secondary"
          onclick={() => {
            /** */
            history.pushState({}, '', '/xpense/add-account')
            injector.getInstance(LocationService).updateState()
          }}>
          ➕Create new account
        </Button>
      </div>
    )
  },
})
