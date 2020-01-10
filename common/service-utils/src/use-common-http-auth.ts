import { Injector } from '@furystack/inject'
import '@furystack/redis-store'
import '@furystack/http-api'
import '@furystack/mongodb-store'
import { createClient } from 'redis'
import { GoogleAccount, Session, User } from './models'
import { createIndexes } from './create-indexes'

declare module '@furystack/inject/dist/Injector' {
  interface Injector {
    useCommonHttpAuth: () => Injector
  }
}

Injector.prototype.useCommonHttpAuth = function() {
  this.setupStores(sm =>
    sm
      .useMongoDb(User, 'mongodb://localhost:27017', 'multiverse-common-auth', 'users')
      .useMongoDb(GoogleAccount, 'mongodb://localhost:27017', 'multiverse-common-auth', 'google-accounts')
      .useRedis(Session, 'sessionId', createClient({ port: 63790, host: 'localhost' })),
  )
    .useHttpApi()
    .useHttpAuthentication({
      enableBasicAuth: false,
      cookieName: 'fsmvsc',
      model: User,
      getUserStore: sm => sm.getStoreFor(User),
      getSessionStore: sm => sm.getStoreFor(Session),
    })
  createIndexes(this)
  return this
}
