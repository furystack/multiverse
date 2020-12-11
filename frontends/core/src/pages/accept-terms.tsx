import { createComponent, Shade } from '@furystack/shades'
import { Button } from '@furystack/shades-common-components'
import { SessionService } from '@common/frontend-utils'
import { MarkdownWidget } from '../components/dashboard/markdown-widget'
import acceptTerms from '../animations/accept-terms.json'
import termsMd from './terms.md'

export const AcceptTermsPage = Shade({
  shadowDomName: 'accept-terms-page',
  render: ({ injector }) => {
    return (
      <div>
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
              style={{ width: '250px', height: '250px', position: 'sticky', top: '0' }}
              mode="bounce"
              src={JSON.stringify(acceptTerms)}></lottie-player>
            <div>
              <h1> Terms and Conditions </h1>
              <h3> In order to proceed, you have to accept the Terms and Conditions </h3>
              <MarkdownWidget width="calc(100% - 270px)" type="markdown" content={termsMd} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', margin: '2em', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            style={{ padding: '1em 2em' }}
            variant="contained"
            color="primary"
            onclick={() => {
              injector.getInstance(SessionService).acceptTerms()
            }}>
            Accept
          </Button>
        </div>
      </div>
    )
  },
})
