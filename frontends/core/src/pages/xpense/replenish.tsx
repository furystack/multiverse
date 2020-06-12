import { Shade, createComponent } from '@furystack/shades'
import { styles, Input, Button, colors } from '@furystack/shades-common-components'
import { XpenseApiService } from '@common/frontend-utils'
import { xpense } from '@common/models'
import { SelectedAccountHeader } from './components/header'
import { GenericErrorPage } from '../generic-error'

export const ReplenishPage = Shade<
  {
    account: xpense.Account
    onReplenished?: (replenishment: xpense.Replenishment) => void
  },
  { amount: number; comment?: string; date: string; error?: Error }
>({
  getInitialState: () => ({
    amount: 0,
    date: new Date().toISOString().split('.')[0],
  }),
  shadowDomName: 'replenish-page',
  render: ({ props, getState, updateState, injector }) => {
    const { error } = getState()
    if (error) {
      return <GenericErrorPage error={error} subtitle="Failed to add to the balance 😓" />
    }
    return (
      <div style={{ ...styles.glassBox, padding: '1em' }}>
        <SelectedAccountHeader account={props.account} area="Replenish" />
        <form
          onsubmit={async (ev) => {
            ev.preventDefault()
            if (!confirm(`Dou you really want to replenish '${props.account.name}' with ${getState().amount}?`)) {
              return
            }
            try {
              const state = getState()
              const replenishment = await injector.getInstance(XpenseApiService).call({
                method: 'POST',
                action: '/accounts/:accountId/replenish',
                url: { accountId: props.account._id },
                body: {
                  creationDate: state.date,
                  amount: state.amount,
                  comment: state.comment,
                },
              })
              props.onReplenished && props.onReplenished(replenishment)
              history.back()
            } catch (e) {
              updateState({ error: e })
            }
          }}>
          <Input
            labelTitle="Replenishment date"
            defaultValue={getState().date}
            type="datetime-local"
            required={true}
            onTextChange={(date) => updateState({ date }, true)}
          />
          <Input
            name="amount"
            labelTitle="Amount"
            type="number"
            value={getState().amount.toString()}
            onchange={(ev) => {
              updateState({ amount: parseInt((ev.target as any).value as string, 10) }, true)
            }}
            required
          />
          <Input
            name="comment"
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
