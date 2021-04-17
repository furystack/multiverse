import { PhysicalStore, StoreManager, FindOptions, WithOptionalId } from '@furystack/core'
import { HttpAuthenticationSettings } from '@furystack/rest-service'
import { Injector } from '@furystack/inject'
import { auth } from '@common/models'
import { v4 } from 'uuid'
import { setupStores } from './setup-stores'

/**
 * gets an existing instance if exists or create and return if not. Throws error on multiple result
 * @param filter The filter term
 * @param instance The instance to be created if there is no instance present
 * @param store The physical store to use
 */
export const getOrCreate = async <T, TId extends keyof T>(
  filter: FindOptions<T, Array<keyof T>>,
  instance: WithOptionalId<T, TId>,
  store: PhysicalStore<T>,
  i: Injector,
) => {
  const result = await store.find(filter)
  const logger = i.logger.withScope('Seeder')
  if (result.length === 1) {
    return result[0]
  } else if (result.length === 0) {
    logger.verbose({
      message: `Entity of type '${store.model.name}' not exists, adding: '${JSON.stringify(filter)}'`,
    })
    await store.add(instance)
    return instance
  } else {
    const message = `Seed filter contains '${result.length}' results for ${JSON.stringify(filter)}`
    logger.warning({ message })
    throw Error(message)
  }
}

export const createUser = async ({
  email,
  password,
  i,
  userRoles,
  displayName,
}: {
  email: string
  password: string
  userRoles: Array<typeof auth.roles[number]>
  i: Injector
  displayName?: string
}) => {
  const sm = i.getInstance(StoreManager)
  const userStore = sm.getStoreFor(auth.User)
  const profileStore = sm.getStoreFor(auth.Profile)
  const ghAccountStore = sm.getStoreFor(auth.GithubAccount)
  const googleAccountStore = sm.getStoreFor(auth.GoogleAccount)

  const user = await getOrCreate<auth.User, '_id'>(
    { filter: { username: { $eq: email } } },
    {
      username: email,
      password: i.getInstance(HttpAuthenticationSettings).hashMethod(password),
      roles: userRoles,
      registrationDate: new Date().toISOString(),
    },
    userStore,
    i,
  )

  const profile = await getOrCreate<auth.Profile, '_id'>(
    {
      filter: { username: { $eq: email } },
    },
    { displayName: displayName || email, username: email, description: '', userSettings: { theme: 'dark' } },
    profileStore,
    i,
  )

  const googleAccount = await getOrCreate(
    { filter: { username: { $eq: email } } },
    {
      googleId: v4(),
      username: email,
      googleApiPayload: {
        email,
        picture: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png',
      },
    } as any,
    googleAccountStore,
    i,
  )

  const githubAccount = await getOrCreate<auth.GithubAccount, '_id'>(
    {
      filter: { username: { $eq: email } },
    },
    {
      githubId: Math.round(Math.random() * 1000),
      username: email,
      githubApiPayload: {
        avatar_url: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png',
      } as any,
      accountLinkDate: new Date().toISOString(),
    },
    ghAccountStore,
    i,
  )

  return [user, profile, googleAccount, githubAccount]
}

/**
 * Seeds the databases with predefined values
 * @param i The injector instance
 */
export const seed = async (i: Injector) => {
  const logger = i.logger.withScope('seeder')
  logger.verbose({ message: 'Seeding data...' })
  const password = 'password'

  await createUser({
    email: 'testTermsNotAcceptedUser@gmail.com',
    password,
    userRoles: [],
    i,
  })

  await createUser({
    email: 'testuser@gmail.com',
    password,
    userRoles: ['terms-accepted'],
    i,
  })

  await createUser({
    email: 'testSysDiags@gmail.com',
    password,
    userRoles: ['terms-accepted', 'sys-diags'],
    i,
  })

  await createUser({
    email: 'testFeatureSwitchAdmin@gmail.com',
    password,
    userRoles: ['terms-accepted', 'feature-switch-admin'],
    i,
  })

  await createUser({
    email: 'testUserAdmin@gmail.com',
    password,
    userRoles: ['terms-accepted', 'user-admin'],
    i,
  })

  await createUser({
    email: 'testMovieAdmin@gmail.com',
    password,
    userRoles: ['terms-accepted', 'movie-admin'],
    i,
  })

  logger.verbose({ message: 'Seeding data completed.' })
}

const injector = new Injector().useCommonHttpAuth()
setupStores(injector)

seed(injector).then(async () => {
  injector.dispose()
  process.exit(0)
})
