import { PasswordCredential, PasswordAuthenticator } from '@furystack/security'
import { Injector } from '@furystack/inject'
import { auth } from '@common/models'
import { getLogger } from '@furystack/logging'
import { useCommonHttpAuth } from '@common/service-utils'
import type { FindOptions, PhysicalStore, WithOptionalId } from '@furystack/core'
import { StoreManager } from '@furystack/core'
import { setupStores } from './setup-stores'

let githubIndex = 0
let googleIndex = 0

/**
 * gets an existing instance if exists or create and return if not. Throws error on multiple result
 * @param filter The filter term
 * @param instance The instance to be created if there is no instance present
 * @param store The physical store to use
 */
export const getOrCreate = async <T, TId extends keyof T>(
  filter: FindOptions<T, Array<keyof T>>,
  instance: WithOptionalId<T, TId>,
  store: PhysicalStore<T, TId>,
  i: Injector,
) => {
  const result = await store.find(filter)
  const logger = getLogger(i).withScope('Seeder')
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
    await logger.warning({ message })
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
  userRoles: Array<(typeof auth.roles)[number]>
  i: Injector
  displayName?: string
}) => {
  const sm = i.getInstance(StoreManager)
  const userStore = sm.getStoreFor(auth.User, '_id')
  const profileStore = sm.getStoreFor(auth.Profile, '_id')
  const passwordStore = sm.getStoreFor(PasswordCredential, 'userName')
  const ghAccountStore = sm.getStoreFor(auth.GithubAccount, '_id')
  const googleAccountStore = sm.getStoreFor(auth.GoogleAccount, '_id')

  const user = await getOrCreate<auth.User, '_id'>(
    { filter: { username: { $eq: email } } },
    {
      username: email,
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
      googleId: googleIndex++,
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
      githubId: githubIndex++,
      username: email,
      githubApiPayload: {
        avatar_url: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png',
      } as any,
      accountLinkDate: new Date().toISOString(),
    },
    ghAccountStore,
    i,
  )

  const passwordCredential = await i.getInstance(PasswordAuthenticator).getHasher().createCredential(email, password)
  await getOrCreate(
    {
      filter: { userName: { $eq: email } },
    },
    passwordCredential,
    passwordStore,
    i,
  )

  return [user, profile, googleAccount, githubAccount]
}

/**
 * Seeds the databases with predefined values
 * @param i The injector instance
 */
export const seed = async (i: Injector) => {
  const logger = getLogger(i).withScope('seeder')
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

const injector = new Injector()
useCommonHttpAuth(injector)
setupStores(injector)

seed(injector)
  .then(async () => {
    injector.dispose()
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
