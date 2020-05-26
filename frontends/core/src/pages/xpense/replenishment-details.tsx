import { Shade, createComponent } from '@furystack/shades'
import { XpenseApiService, getErrorMessage } from '@common/frontend-utils'
import { xpense } from '@common/models'
import { Init } from '../init'

export const ReplenishmentDetails = Shade<
  { replenishmentId: string },
  { isLoading: boolean; replenishment?: xpense.Replenishment; error?: string }
>({
  getInitialState: () => ({
    isLoading: true,
  }),
  shadowDomName: 'xpense-replenishment-details',
  constructed: async ({ injector, props, updateState }) => {
    try {
      const replenishment = await injector.getInstance(XpenseApiService).call({
        method: 'GET',
        action: '/replenishments/:id',
        url: { replenishmentId: props.replenishmentId },
      })
      updateState({ replenishment })
    } catch (error) {
      const errorMessage = await getErrorMessage(error)
      updateState({ error: errorMessage })
    } finally {
      updateState({ isLoading: false })
    }
  },
  render: ({ getState }) => {
    const { isLoading, replenishment, error } = getState()
    if (isLoading) {
      return <Init message="Retrieving replenishment details..." />
    }
    if (error || !replenishment) {
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
            <h3>Failed to load replenishment 😓</h3>
          </div>
          <a href="/">Reload page</a>
        </div>
      )
    }
    return (
      <pre>
        <code>{JSON.stringify(replenishment, undefined, 2)}</code>
      </pre>
    )
  },
})
