import '@furystack/http-api'
import { registerExitHandler } from 'common-service-utils'
import { injector } from './config'

injector.useDefaultLoginRoutes().listenHttp({
  port: parseInt(process.env.APP_SERVICE_PORT as string, 10) || 9090,
})

registerExitHandler(injector)
