import { Injector } from '@furystack/inject'
import '@furystack/redis-store'
import '@furystack/http-api'
import '@furystack/mongodb-store'
import { createClient } from 'redis'
import { frontends } from 'sites'
import { Session, User } from './models'
import { verifyAndCreateIndexes } from './create-indexes'

declare module '@furystack/inject/dist/Injector' {
  interface Injector {
    useCommonHttpAuth: () => Injector
  }
}

Injector.prototype.useCommonHttpAuth = function() {
  this.setupStores(sm =>
    sm
      .useMongoDb(User, 'mongodb://localhost:27017', 'multiverse-common-auth', 'users')
      .useRedis(Session, 'sessionId', createClient({ port: 63790, host: 'localhost' })),
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
