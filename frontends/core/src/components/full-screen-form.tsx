import { createComponent, Shade } from '@furystack/shades'
import { Paper } from '@furystack/shades-common-components'

export interface FullScreenFormProps {
  title: string
  actions: JSX.Element
  onSubmit: (ev: Event) => void
}

export const FullScreenForm = Shade<FullScreenFormProps>({
  shadowDomName: 'full-screen-form',
  constructed: ({ element }) => {
    setTimeout(() => {
      element.querySelector('input')?.focus()
    })
  },
  render: ({ props, children }) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2em' }}>
        <Paper
          elevation={3}
          style={{
            maxWidth: '800px',
            flexGrow: '1',
          }}
        >
          <h1>{props.title}</h1>
          <form
            onsubmit={(ev) => {
              console.log(ev)
              props.onSubmit(ev)
            }}
          >
            {children}
            <hr />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>{props.actions}</div>
          </form>
        </Paper>
      </div>
    )
  },
})
