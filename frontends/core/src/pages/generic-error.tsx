import { Shade, createComponent } from '@furystack/shades'
import { getErrorMessage } from '@common/frontend-utils'
import { Button } from '@furystack/shades-common-components'

import redCross from '../animations/error-red-cross.json'
import deadSmiley from '../animations/error-dead-smiley.json'

export interface GenericErrorProps {
  mainTitle?: string
  subtitle?: string
  description?: JSX.Element
  error?: any
  retry?: () => void
}

export const GenericErrorPage = Shade<GenericErrorProps>({
  shadowDomName: 'multiverse-generic-error-page',
  render: ({ props }) => {
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
          <div style={{ display: 'flex' }}>
            <lottie-player
              autoplay
              style={{ width: '250px', height: '250px' }}
              mode="bounce"
              src={Math.random() > 0.5 ? JSON.stringify(redCross) : JSON.stringify(deadSmiley)}></lottie-player>
            <div>
              <h1> {props.mainTitle || 'WhoOoOops... 😱'}</h1>
              <h3> {props.subtitle || 'Something terrible happened 😓'}</h3>

              {props.description ||
                (props.error && getErrorMessage(props.error)) ||
                "And you know what's worse? No further details are available... 😿"}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', marginTop: '2em', width: '70%', justifyContent: 'space-evenly' }}>
          <a href="/">
            <Button>Go Home</Button>
          </a>
          {props.retry ? <Button onclick={() => props.retry?.()}>Retry</Button> : null}
          {props.error ? (
            <Button onclick={() => alert('Sorry, this feature is not implemented yet 😅')}>Report error</Button>
          ) : null}
        </div>
      </div>
    )
  },
})
