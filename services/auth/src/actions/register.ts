import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { auth } from '@common/models'
import { HttpUserContext } from '@furystack/rest-service'

export const RegisterAction: RequestAction<{ body: { email: string; password: string }; result: auth.User }> = async ({
  injector,
  getBody,
  response,
}) => {
  const logger = injector.logger.withScope('RegisterAction')
  const storeManager = injector.getInstance(StoreManager)
  const { email, password } = await getBody()
  const userStore = storeManager.getStoreFor(auth.User)
  const existing = await userStore.find({ filter: { username: { $eq: email } } })
  if (existing && existing.length) {
    logger.information({ message: 'Tried to register an already existing user', data: { email, user: existing[0] } })
    throw new RequestError('Failed to register user', 400)
  }
  const userCtx = injector.getInstance(HttpUserContext)
  const { created } = await userStore.add({
    username: email,
    password: userCtx.authentication.hashMethod(password),
    roles: ['terms-accepted'],
    registrationDate: new Date().toISOString(),
  })
  const newUser = created[0]
  await storeManager.getStoreFor(auth.Profile).add({ username: newUser.username, displayName: newUser.username })
  await userCtx.cookieLogin(newUser, response)

  delete newUser.password
  logger.information({ message: 'A New user has been registered', data: { ...newUser } })
  return JsonResult(newUser, 200)
}
