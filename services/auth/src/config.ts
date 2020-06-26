import '@furystack/auth-google'
import '@furystack/repository/dist/injector-extension'
import { ConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { auth } from '@common/models'
import { databases } from '@common/config'

export const injector = new Injector()

injector
  .useDbLogger({ appName: 'auth' })
  .useCommonHttpAuth()
  .setupStores((sm) =>
    sm
      .useMongoDb({
        primaryKey: '_id',
        model: auth.GoogleAccount,
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: 'google-accounts',
        options: databases.standardOptions,
      })
      .useMongoDb({
        primaryKey: '_id',
        model: auth.GithubAccount,
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: 'github-accounts',
        options: databases.standardOptions,
      })
      .useMongoDb({
        primaryKey: '_id',
        model: auth.Profile,
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: 'profiles',
        options: databases.standardOptions,
      }),
  )
  .useLogging(ConsoleLogger)
  .setupRepository((repo) =>
    repo.createDataSet(auth.Profile, {
      authorizeUpdateEntity: async ({ injector: i, entity: profile }) => {
        const currentUser = await i.getCurrentUser()
        if (profile.username === currentUser.username) {
          return { isAllowed: true }
        }
        return { isAllowed: false, message: 'Only the owner can modify its profile' }
      },
    }),
  )
