import { Shade, createComponent, LocationService } from '@furystack/shades'
import { XpenseApiService } from 'common-frontend-utils'
import { Button, Autocomplete, styles } from 'common-components'
import { xpense } from 'common-models'
import { Widget } from '../welcome-page'

export const XpensePage = Shade<
  { initialAccount?: string },
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
  getInitialState: ({ props }) => ({
    accounts: [],
    accountNames: [],
    selectedAccountName: props.initialAccount || '',
  }),
  constructed: async ({ injector, updateState, getState }) => {
    const accounts = await injector.getInstance(XpenseApiService).call({
      method: 'GET',
      action: '/availableAccounts',
    })
    updateState({
      accounts,
      accountNames: accounts.map((a) => `${a.ownerType}/${a.ownerName}/${a.name}`),
      ...(getState().selectedAccountName
        ? {}
        : { selectedAccountName: `${accounts[0].ownerType}/${accounts[0].ownerName}/${accounts[0].name}` }),
    })
  },
  render: ({ getState, injector, updateState }) => {
    const { accounts, accountNames, selectedAccountName } = getState()
    const [selectedOwnerType, selectedOwnerName, selectedName] = selectedAccountName.split('/')
    const selectedAccount = accounts.find(
      (ac) => ac.name === selectedName && ac.ownerType === selectedOwnerType && ac.ownerName === selectedOwnerName,
    )
    return (
      <div style={styles.glassBox}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <p style={{ padding: '0 2em', fontVariant: 'all-petite-caps' }}>{selectedAccount?.name}</p>
          <p>{selectedAccount?.current}</p>
          <div style={{ flex: '1' }} />
          <Autocomplete
            strict
            inputProps={{ name: 'account', labelTitle: 'Select account', value: selectedAccountName }}
            suggestions={accountNames}
            onchange={(account) => {
              history.pushState({}, '', `/xpense/${account}`)
              updateState({ selectedAccountName: account })
            }}
          />
          <Button
            title="Create new account"
            variant="secondary"
            onclick={() => {
              /** */
              history.pushState({}, '', '/xpense/add-account')
              injector.getInstance(LocationService).updateState()
            }}>
            Create
          </Button>
        </div>
        {selectedAccountName ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '2em' }}>
            <Widget
              icon="💸"
              name="Replenish"
              index={0}
              description={`Add to the balance of ${selectedAccountName}`}
              url={`/xpense/${selectedAccountName}/replenish`}
            />
            <Widget
              icon="🛒"
              name="Shopping"
              index={1}
              description={`Add to the balance of ${selectedAccountName}`}
              url={`/xpense/${selectedAccountName}/shopping`}
            />
          </div>
        ) : (
          <div>...select an account first...</div>
        )}
      </div>
    )
  },
})
