import '@furystack/auth-google'
import { verifyAndCreateIndexes } from '@common/service-utils'
import '@furystack/repository/dist/injector-extension'
import { HttpUserContext } from '@furystack/rest-service'
import { ConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { GoogleAccount, GithubAccount, Organization, Profile } from '@common/models'
import { databases } from '@common/config'

export const injector = new Injector()

injector
  .useDbLogger({ appName: 'wrap-r' })
  .useCommonHttpAuth()
  .setupStores((sm) =>
    sm
      .useMongoDb({
        model: GoogleAccount,
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: 'google-accounts',
        options: databases.standardOptions,
      })
      .useMongoDb({
        model: GithubAccount,
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: 'github-accounts',
        options: databases.standardOptions,
      })
      .useMongoDb({
        model: Profile,
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: 'profiles',
        options: databases.standardOptions,
      }),
  )
  .useLogging(ConsoleLogger)
  .setupRepository((repo) =>
    repo.createDataSet(Profile, {
      name: 'profiles',
      authorizeUpdateEntity: async ({ injector: i, entity: profile }) => {
        const currentUser = await i.getInstance(HttpUserContext).getCurrentUser()
        if (profile.username === currentUser.username) {
          return { isAllowed: true }
        }
        return { isAllowed: false, message: 'Only the owner can modify its profile' }
      },
    }),
  )

verifyAndCreateIndexes({
  injector,
  model: GoogleAccount,
  indexName: 'googleId',
  indexSpecification: { googleId: 1 },
  indexOptions: { unique: true },
})
verifyAndCreateIndexes({
  injector,
  model: GithubAccount,
  indexName: 'githubId',
  indexSpecification: { githubId: 1 },
  indexOptions: { unique: true },
})

verifyAndCreateIndexes({
  injector,
  model: Profile,
  indexName: 'profileUserName',
  indexSpecification: { username: 1 },
  indexOptions: { unique: true },
})

verifyAndCreateIndexes({
  injector,
  model: Organization,
  indexName: 'orgName',
  indexSpecification: { name: 1 },
  indexOptions: { unique: true },
})
