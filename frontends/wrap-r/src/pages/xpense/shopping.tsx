import { Shade, createComponent } from '@furystack/shades'
import { styles, Autocomplete, Button, Input, colors } from 'common-components'
import { xpense } from 'common-models'
import { XpenseApiService } from 'common-frontend-utils'
import { Init } from '../init'
import { AccountSelector } from './components/account-selector'
import { SelectedAccountHeader } from './components/header'
import { ShoppingEntry, ShoppingEntryRow } from './components/shopping-entry'

export const XpenseShoppingPage = Shade<
  xpense.Account & { shops: xpense.Shop[]; items: xpense.Item[] },
  { entries: ShoppingEntry[]; shopName: string; error?: Error; isSaveInProgress?: boolean }
>({
  shadowDomName: 'xpense-shopping-page',
  getInitialState: () => ({
    shopName: '',
    entries: [],
  }),
  render: ({ props, getState, updateState, element, injector }) => {
    const { error, isSaveInProgress } = getState()

    const updateTotal = () => {
      const { entries } = getState()
      const total = entries.reduce((last, current) => last + current.totalPrice, 0)
      ;(element.querySelector('#total') as HTMLInputElement).value = total.toString()
    }

    if (isSaveInProgress) {
      return <Init message="Saving the shopping..." />
    }

    if (error) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 100px',
          }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              perspective: '400px',
              animation: 'shake 150ms 2 linear',
            }}>
            <h1>WhoOoOops... 😱</h1>
            <h3>Something really really bad happened... 😓</h3>
            <p>Something went wrong during saving your shopping. '{props.name}'</p>
            <pre style={{ color: colors.error.main }}>{JSON.stringify(error)}</pre>
          </div>
          <a href="/">Go to home...</a>
        </div>
      )
    }

    return (
      <div style={{ ...styles.glassBox, padding: '1em' }}>
        <div style={{ display: 'flex' }}>
          <SelectedAccountHeader {...props} area="Shopping" />
          <div style={{ flex: '1' }} />
          <AccountSelector onSelectAccount={(acc) => history.pushState({}, '', `/xpense/${acc}/shopping`)} />
        </div>
        <form
          onsubmit={async (ev) => {
            ev.preventDefault()
            try {
              updateState({ isSaveInProgress: true })
              await injector.getInstance(XpenseApiService).call({
                method: 'POST',
                action: '/:type/:owner/:accountName/shop',
                url: { type: props.ownerType, owner: props.ownerName, accountName: props.name },
                body: {
                  shopName: getState().shopName,
                  entries: getState().entries.map((e) => ({
                    itemName: e.name,
                    amount: e.amount,
                    unitPrice: e.unitPrice,
                  })), //  as Array<{ itemName: string; amount: number; unitPrice: number }>,
                },
              })
              history.pushState({}, '', `/xpense/${props.ownerType}/${props.ownerName}/${props.name}`)
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {getState().entries.map((entry, index) => (
              <ShoppingEntryRow
                items={props.items}
                entry={entry}
                onRemove={(deleted) =>
                  updateState(
                    {
                      entries: getState().entries.filter((e) => e !== deleted),
                    },
                    true,
                  )
                }
                onChange={(change) => {
                  const { entries } = getState()
                  entries[index] = change
                  updateState({ entries }, true)
                  updateTotal()
                }}
              />
            ))}
          </div>
          <div style={{ paddingTop: '1em' }}>
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
              onclick={() =>
                updateState({ entries: [...getState().entries, { name: '', totalPrice: 0, unitPrice: 0, amount: 1 }] })
              }>
              Add entry
            </Button>
            <Button type="submit">Save shopping</Button>
          </div>
        </form>
      </div>
    )
  },
})
