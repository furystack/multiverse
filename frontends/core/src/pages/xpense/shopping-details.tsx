import { Shade, createComponent } from '@furystack/shades'
import { xpense } from '@common/models'
import { XpenseApiService, getErrorMessage } from '@common/frontend-utils'
import { Init } from '../init'

export const ShoppingDetails = Shade<
  { account: xpense.Account; shoppingId: string; items: xpense.Item[] },
  { isLoading: boolean; shopping?: xpense.Shopping; error?: string }
>({
  getInitialState: () => ({ isLoading: true }),
  constructed: async ({ injector, props, updateState }) => {
    try {
      const shopping = await injector.getInstance(XpenseApiService).call({
        method: 'GET',
        action: '/shoppings/:id',
        url: { shoppingId: props.shoppingId },
      })
      updateState({ shopping })
    } catch (error) {
      const errorMessage = await getErrorMessage(error)
      updateState({ error: errorMessage })
    } finally {
      updateState({ isLoading: false })
    }
  },
  shadowDomName: 'xpense-shopping-details',
  render: ({ getState }) => {
    const { isLoading, error, shopping } = getState()
    if (isLoading) {
      return <Init message="Getting Shopping info..." />
    }
    if (error || !shopping) {
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
            <h3>Failed to load shopping info 😓</h3>
          </div>
          <a href="/">Reload page</a>
        </div>
      )
    }
    return (
      <pre>
        <code>{JSON.stringify(shopping, undefined, 2)}</code>
      </pre>
    )
  },
})
