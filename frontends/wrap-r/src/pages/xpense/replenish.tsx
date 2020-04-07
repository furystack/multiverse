import { Shade, createComponent } from '@furystack/shades'
import { styles, Input, Button, colors } from 'common-components'
import { XpenseApiService } from 'common-frontend-utils'
import { xpense } from 'common-models'
import { SelectedAccountHeader } from './components/header'

export const ReplenishPage = Shade<
  xpense.Account & { onReplenished: (replenishment: xpense.Replenishment) => void },
  { amount: number; comment?: string; error?: Error }
>({
  getInitialState: () => ({
    amount: 0,
  }),
  shadowDomName: 'replenish-page',
  render: ({ props, getState, updateState, injector }) => {
    const { error } = getState()
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
            <p>Something went wrong during replenishing the balance for account '{props.name}'</p>
            <pre style={{ color: colors.error.main }}>{JSON.stringify(error)}</pre>
          </div>
          <a href="/">Go to home...</a>
        </div>
      )
    }
    return (
      <div style={{ ...styles.glassBox, padding: '1em' }}>
        <SelectedAccountHeader account={props} area="Replenish" />
        <form
          onsubmit={async (ev) => {
            ev.preventDefault()
            try {
              const replenishment = await injector.getInstance(XpenseApiService).call({
                method: 'POST',
                action: '/:type/:owner/:accountName/replenish',
                url: { type: props.ownerType, owner: props.ownerName, accountName: props.name },
                body: {
                  amount: getState().amount,
                  comment: getState().comment,
                },
              })
              props.onReplenished(replenishment)
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
          <Button type="button" onclick={() => history.back()} style={{ marginRight: '1em' }}>
            Back
          </Button>
          <Button type="submit" variant="primary">
            Replenish
          </Button>
        </form>
      </div>
    )
  },
})
