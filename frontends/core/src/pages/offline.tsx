import { Shade, createComponent } from '@furystack/shades'
import { environmentOptions } from '..'
import { GenericErrorPage } from './generic-error'

export const Offline = Shade({
  shadowDomName: 'shade-offline',
  render: () => {
    return (
      <GenericErrorPage
        subtitle="The service seems to be offline 😓"
        description={
          <div>
            <p>
              There was a trouble connecting to the backend service at{' '}
              <a href={environmentOptions.serviceUrl.externalPath} target="_blank">
                {environmentOptions.serviceUrl.externalPath}
              </a>
              . It seems to be the service is unaccessible at the moment. You can check the following things:
            </p>
            <ul>
              <li>
                The URL above is correct. You can set in in your 'SERVICE_URL' environment variable before building the
                app.
              </li>
              <li>
                CORS is enabled in the service from <a href={window.location.origin}>{window.location.origin}</a>
              </li>
              <li>You have started the service :)</li>
            </ul>
          </div>
        }
      />
    )
  },
})
