import { Shade, createComponent, LocationService } from '@furystack/shades'
import { XpenseApiService } from 'common-frontend-utils/src'
import { xpense } from 'common-models'
import { AutoComplete, Button } from 'common-components/src'

export const XpensePage = Shade<
  {},
  { accounts: Array<{ name: string; ownerType: xpense.Account['ownerType']; ownerName: xpense.Account['ownerName'] }> }
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
        <AutoComplete<typeof accounts[number]>
          getSuggestions={async (term) => accounts.filter((a) => a.name.includes(term))}
          renderSuggestion={(suggestion) => <div>{suggestion.name}</div>}
        />
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
