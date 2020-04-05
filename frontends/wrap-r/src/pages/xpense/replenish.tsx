import { Shade, createComponent } from '@furystack/shades'
import { styles, Input, Button, colors } from 'common-components'
import { XpenseApiService } from 'common-frontend-utils'
import { xpense } from 'common-models'
import { Init } from '../init'

export const ReplenishPage = Shade<
  { accountOwner: string; accountType: 'user' | 'organization'; accountName: string },
  { amount: number; comment?: string; error?: Error; account?: xpense.Account }
>({
  getInitialState: () => ({
    amount: 0,
  }),
  constructed: async ({ injector, props, updateState }) => {
    try {
      const account: xpense.Account = await injector.getInstance(XpenseApiService).call({
        method: 'GET',
        action: '/:type/:owner/:accountName',
        query: {
          accountName: props.accountName,
          owner: props.accountOwner,
          type: props.accountType,
        },
      })
      updateState({ account })
    } catch (error) {
      updateState({ error })
    }
  },
  shadowDomName: 'replenish-page',
  render: ({ props, getState, updateState, injector }) => {
    const { account, error } = getState()
    if (!account) {
      return <Init message="Loading account details..." />
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
            <h3>Failed to add to the balance 😓</h3>
            <p>Something went wrong during replenishing the balance for account '{props.accountName}'</p>
            <pre style={{ color: colors.error.main }}>{JSON.stringify(error)}</pre>
          </div>
          <a href="/">Go to home...</a>
        </div>
      )
    }
    return (
      <div style={{ ...styles.glassBox, padding: '1em' }}>
        <h1>Replenish the balance for {props.accountName}</h1>
        <h3>
          The current balance is: <strong>{account.current || 0}</strong>
        </h3>
        <form
          onsubmit={async (ev) => {
            ev.preventDefault()
            try {
              await injector.getInstance(XpenseApiService).call({
                method: 'POST',
                action: '/:type/:owner/:accountName/replenish',
                body: {
                  amount: getState().amount,
                  comment: getState().comment,
                },
              })
              history.back()
            } catch (e) {
              updateState({ error: e })
            }
          }}>
          <Input
            labelTitle="Amount"
            type="number"
            value={getState().amount.toString()}
            onchange={(ev) => {
              updateState({ amount: parseInt((ev.target as any).value as string, 10) }, true)
            }}
            required
          />
          <Input
            type="text"
            labelTitle="Comment"
            value={getState().comment || ''}
            onchange={(ev) => {
              updateState({ comment: (ev.target as any).value }, true)
            }}
          />
          <Button type="submit" variant="primary">
            Replenish
          </Button>
        </form>
      </div>
    )
  },
})
