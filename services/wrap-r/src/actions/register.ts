import { RequestAction, JsonResult, HttpUserContext } from '@furystack/http-api'
import { StoreManager } from '@furystack/core'
import { User } from 'common-service-utils'

export const RegisterAction: RequestAction = async injector => {
  const logger = injector.logger.withScope('RegisterAction')
  const { email, password } = await injector.getRequest().readPostBody<{ email: string; password: string }>()
  const userStore = injector.getInstance(StoreManager).getStoreFor(User)
  const existing = await userStore.search({ filter: { username: email } })
  if (existing && existing.length) {
    logger.information({ message: 'Tried to register an already existing user', data: { email, user: existing[0] } })
    return JsonResult({ message: 'Failed to register user' }, 500)
  }
  const userCtx = injector.getInstance(HttpUserContext)
  try {
    const newUser = await userStore.add({
      username: email,
      password: userCtx.authentication.hashMethod(password),
      roles: ['terms-accepted'],
      registrationDate: new Date().toISOString(),
    } as User)
    await userCtx.cookieLogin(newUser, injector.getResponse())

    delete newUser.password
    logger.information({ message: 'A New user has been registered', data: { ...newUser } })
    return JsonResult(newUser, 200)
  } catch (error) {
    logger.warning({ message: 'Failed to register a new user', data: { error, email } })
    return JsonResult({ message: 'Failed to register user' }, 500)
  }
}
