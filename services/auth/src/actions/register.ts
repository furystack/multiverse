import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { User, Profile } from '@common/models'
import { HttpUserContext } from '@furystack/rest-service'

export const RegisterAction: RequestAction<{ body: { email: string; password: string }; result: User }> = async ({
  injector,
  getBody,
}) => {
  const logger = injector.logger.withScope('RegisterAction')
  const storeManager = injector.getInstance(StoreManager)
  const { email, password } = await getBody()
  const userStore = storeManager.getStoreFor(User)
  const existing = await userStore.search({ filter: { username: { $eq: email } } })
  if (existing && existing.length) {
    logger.information({ message: 'Tried to register an already existing user', data: { email, user: existing[0] } })
    throw new RequestError('Failed to register user', 400)
  }
  const userCtx = injector.getInstance(HttpUserContext)
  const newUser = await userStore.add({
    username: email,
    password: userCtx.authentication.hashMethod(password),
    roles: ['terms-accepted'],
    registrationDate: new Date().toISOString(),
  } as User)
  await storeManager.getStoreFor(Profile).add({ username: newUser.username, displayName: newUser.username } as Profile)
  await userCtx.cookieLogin(newUser, injector.getResponse())

  delete newUser.password
  logger.information({ message: 'A New user has been registered', data: { ...newUser } })
  return JsonResult(newUser, 200)
}
