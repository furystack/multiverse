import '@furystack/redis-store'
import '@furystack/http-api'
import '@furystack/mongodb-store'
import { Injector } from '@furystack/inject'
import { createClient } from 'redis'
import { frontends, databases, sessionStore } from 'sites'
import { verifyAndCreateIndexes } from './create-indexes'
import { Session, User } from './models'

declare module '@furystack/inject/dist/Injector' {
  interface Injector {
    useCommonHttpAuth: () => Injector
  }
}

Injector.prototype.useCommonHttpAuth = function() {
  this.setupStores(sm =>
    sm
      .useMongoDb(User, databases.commonAuth, 'multiverse-common-auth', 'users')
      .useRedis(
        Session,
        'sessionId',
        createClient({ port: parseInt(sessionStore.port, 10) || undefined, host: sessionStore.host }),
      ),
  )
    .useHttpApi({
      corsOptions: {
        credentials: true,
        origins: Object.values(frontends),
      },
    })
    .useHttpAuthentication({
      enableBasicAuth: false,
      cookieName: 'fsmvsc',
      model: User,
      getUserStore: sm => sm.getStoreFor(User),
      getSessionStore: sm => sm.getStoreFor(Session),
    })

  verifyAndCreateIndexes({
    injector: this,
    model: User,
    indexSpecification: { username: 1 },
    indexName: 'username',
    indexOptions: { unique: true },
  })

  return this
}
