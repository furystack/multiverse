import { RequestAction, JsonResult, HttpUserContext } from '@furystack/http-api'
import { StoreManager } from '@furystack/core'
import { User } from 'common-service-utils'

export const RegisterAction: RequestAction = async injector => {
  const { email, password } = await injector.getRequest().readPostBody<{ email: string; password: string }>()
  const userStore = injector.getInstance(StoreManager).getStoreFor(User)
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
    return JsonResult(newUser, 200)
  } catch (error) {
    return JsonResult({ message: 'Failed to register user' }, 500)
  }
}
