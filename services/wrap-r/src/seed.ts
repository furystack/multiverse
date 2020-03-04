import { PhysicalStore, StoreManager, SearchOptions } from '@furystack/core'
import { HttpAuthenticationSettings } from '@furystack/http-api'
import { Injector } from '@furystack/inject'
import { User } from 'common-models'
import { GoogleAccount } from './models'
import { GithubAccount } from './models/github-account'
import { injector } from './config'

/**
 * gets an existing instance if exists or create and return if not. Throws error on multiple result
 * @param filter The filter term
 * @param instance The instance to be created if there is no instance present
 * @param store The physical store to use
 */
export const getOrCreate = async <T>(
  filter: SearchOptions<T, Array<keyof T>>,
  instance: Partial<T>,
  store: PhysicalStore<T>,
  i: Injector,
) => {
  const result = await store.search(filter)
  const logger = i.logger.withScope('Seeder')
  if (result.length === 1) {
    return result[0]
  } else if (result.length === 0) {
    logger.verbose({
      message: `Entity of type '${store.model.name}' not exists, adding: '${JSON.stringify(filter)}'`,
    })
    return await store.add(instance as T)
  } else {
    const message = `Seed filter contains '${result.length}' results for ${JSON.stringify(filter)}`
    logger.warning({ message })
    throw Error(message)
  }
}

/**
 * Seeds the databases with predefined values
 * @param i The injector instance
 */
export const seed = async (i: Injector) => {
  const logger = i.logger.withScope('seeder')
  logger.verbose({ message: 'Seeding data...' })
  const sm = i.getInstance(StoreManager)
  const userStore = sm.getStoreFor(User)
  const ghAccountStore = sm.getStoreFor(GithubAccount)
  const googleAccountStore = sm.getStoreFor(GoogleAccount)

  const testUser = await getOrCreate(
    { filter: { username: { $eq: 'testuser@gmail.com' } } },
    {
      username: 'testuser@gmail.com',
      password: i.getInstance(HttpAuthenticationSettings).hashMethod('password'),
      roles: [],
    },
    userStore,
    i,
  )

  await getOrCreate(
    {
      filter: { username: { $eq: testUser.username } },
    },
    { githubId: 666, username: testUser.username },
    ghAccountStore,
    i,
  )

  await getOrCreate(
    { filter: { username: { $eq: testUser.username } } },
    { googleId: 666, username: testUser.username },
    googleAccountStore,
    i,
  )

  logger.verbose({ message: 'Seeding data completed.' })
}

seed(injector).then(async () => {
  injector.dispose()
  process.exit(0)
})
