import '@furystack/rest-service'
import { services } from 'sites'
import { injector } from './config'

const serviceUrl = new URL(services.wrapr)

injector
  .useDefaultLoginRoutes()
  .listenHttp({
    port: parseInt(serviceUrl.port, 10),
    hostName: serviceUrl.hostname,
  })
  .disposeOnProcessExit()
