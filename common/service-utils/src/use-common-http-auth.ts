import { Injector } from '@furystack/inject'
import '@furystack/redis-store'
import '@furystack/http-api'
import '@furystack/typeorm-store'
import { createClient } from 'redis'
import { Session, User } from './models'

declare module '@furystack/inject/dist/Injector' {
  interface Injector {
    useCommonHttpAuth: () => Injector
  }
}

Injector.prototype.useCommonHttpAuth = function() {
  this.useTypeOrm({
    type: 'postgres',
    host: 'localhost',
    port: 54321,
    username: 'multiverse',
    password: 'pwd0123456789',
    database: 'multiverse',
    entities: [User],
    logging: true,
    synchronize: true,
  })
    .setupStores(sm =>
      sm.useTypeOrmStore(User).useRedis(Session, 'sessionId', createClient({ port: 63790, host: 'localhost' })),
    )
    .useHttpApi()
    .useHttpAuthentication({
      enableBasicAuth: false,
      cookieName: 'fsmvsc',
      model: User,
      getUserStore: sm => sm.getStoreFor(User),
      getSessionStore: sm => sm.getStoreFor(Session),
    })
  return this
}
