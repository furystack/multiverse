import { Shade, createComponent } from '@furystack/shades'
import { styles, Autocomplete, Button, Input } from '@furystack/shades-common-components'
import { xpense } from '@common/models'
import { XpenseApiService } from '@common/frontend-utils'
import { Init } from '../init'
import { AccountSelector } from './components/account-selector'
import { SelectedAccountHeader } from './components/header'
import { ShoppingEntry, ShoppingEntryRow } from './components/shopping-entry'

export const XpenseShoppingPage = Shade<
  { account: xpense.Account; shops: xpense.Shop[]; items: xpense.Item[]; onShopped?: (total: xpense.Shopping) => void },
  { entries: ShoppingEntry[]; shopName: string; error?: Error; isSaveInProgress?: boolean; date: string }
>({
  shadowDomName: 'xpense-shopping-page',
  getInitialState: () => ({
    shopName: '',
    entries: [],
    date: new Date().toISOString().split('.')[0],
  }),
  render: ({ props, getState, updateState, element, injector }) => {
    const { isSaveInProgress } = getState()

    const updateTotal = () => {
      const { entries } = getState()
      const total = entries.reduce((last, current) => last + (current.totalPrice || 0), 0)
      ;(element.querySelector('#total') as HTMLInputElement).value = total.toString()
      return total
    }

    if (isSaveInProgress) {
      return <Init message="Saving the shopping..." />
    }

    return (
      <div style={{ ...styles.glassBox, padding: '1em', height: '100%', overflow: 'auto' }}>
        <div style={{ display: 'flex' }}>
          <SelectedAccountHeader {...props} area="Shopping" account={props.account} />
          <div style={{ flex: '1' }} />
          <AccountSelector
            onSelectAccount={(acc) => history.pushState({}, '', `/xpense/${acc}/shopping`)}
            currentAccount={props.account}
          />
        </div>
        <form
          onsubmit={async (ev) => {
            ev.preventDefault()
            const total = updateTotal()
            if (
              !confirm(
                `Are you sure to save your shopping? \r\n The total amount is '${total}'. The account balance is ${
                  props.account.current
                }. The balance will be ${props.account.current - total} after submitting.`,
              )
            ) {
              return
            }
            try {
              const state = getState()
              updateState({ isSaveInProgress: true })
              const shopping = await injector.getInstance(XpenseApiService).call({
                method: 'POST',
                action: '/:type/:owner/:accountName/shop',
                url: { type: props.account.ownerType, owner: props.account.ownerName, accountName: props.account.name },
                body: {
                  creationDate: state.date,
                  shopName: state.shopName,
                  entries: state.entries.map((e) => ({
                    itemName: e.name,
                    amount: e.amount,
                    unitPrice: e.unitPrice,
                  })),
                },
              })
              props.onShopped && props.onShopped(shopping)
              history.pushState({}, '', `/xpense/${props.account._id}`)
            } catch (e) {
              updateState({ error: e })
            } finally {
              updateState({ isSaveInProgress: false })
            }
          }}>
          <Autocomplete
            inputProps={{ labelTitle: 'Shop', required: true, value: getState().shopName }}
            suggestions={props.shops.map((s) => s.name)}
            onchange={(shopName) => {
              updateState({ shopName })
              if (getState().entries.length < 1) {
                updateState({ entries: [{ name: '', amount: 1, totalPrice: 0, unitPrice: 0 }] })
              }
            }}
          />
          <Input
            type="datetime-local"
            labelTitle="Shopping date"
            required={true}
            onTextChange={(date) => updateState({ date }, true)}
            defaultValue={getState().date}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {getState().entries.map((entry, index) => (
              <ShoppingEntryRow
                items={props.items}
                entry={entry}
                onRemove={() => {
                  updateState({
                    entries: getState().entries.filter((e) => e !== getState().entries[index]),
                  })
                  updateTotal()
                }}
                onChange={(change) => {
                  const { entries } = getState()
                  entries[index] = change
                  updateState({ entries }, true)
                  updateTotal()
                }}
              />
            ))}
          </div>
          <div style={{ marginBottom: '2em' }}>
            <Input
              id="total"
              readOnly
              labelTitle="Total amount"
              value="0"
              style={{ fontSize: '2em', display: 'inline-flex' }}
            />
            <hr />
            <Button
              type="button"
              onclick={() => {
                updateState({ entries: [...getState().entries, { name: '', totalPrice: 0, unitPrice: 0, amount: 1 }] })
                updateTotal()
              }}>
              Add entry
            </Button>
            <Button type="submit">Save shopping</Button>
          </div>
        </form>
      </div>
    )
  },
})
