import '@furystack/redis-store'
import '@furystack/rest-service'
import '@furystack/mongodb-store'
import { Injector } from '@furystack/inject/dist/injector'
import { createClient } from 'redis'
import { databases, sessionStore } from 'sites'
import { Session, User } from 'common-models'
import { verifyAndCreateIndexes } from './create-indexes'

declare module '@furystack/inject/dist/injector' {
  interface Injector {
    useCommonHttpAuth: () => this
  }
}

Injector.prototype.useCommonHttpAuth = function() {
  this.setupStores(sm =>
    sm
      .useMongoDb({
        model: User,
        url: databases.commonAuth,
        db: 'multiverse-common-auth',
        collection: 'users',
        options: { useUnifiedTopology: true },
      })
      .useRedis(
        Session,
        'sessionId',
        createClient({ port: parseInt(sessionStore.port, 10) || undefined, host: sessionStore.host }),
      ),
  ).useHttpAuthentication({
    enableBasicAuth: true,
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

export {}
