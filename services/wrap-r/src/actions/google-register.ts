import { HttpUserContext, RequestAction, JsonResult } from '@furystack/http-api'
import { GoogleLoginService } from '@furystack/auth-google'
import { StoreManager } from '@furystack/core'
import { GoogleAccount } from 'common-service-utils'

/**
 * HTTP Request action for Google Logins
 */

export const GoogleRegisterAction: RequestAction = async injector => {
  const logger = injector.logger.withScope('GoogleRegisterAction')

  const userContext = injector.getInstance(HttpUserContext)
  const googleAcccounts = injector.getInstance(StoreManager).getStoreFor(GoogleAccount)
  const { token } = await injector.getRequest().readPostBody<{ token: string }>()

  if (!token) {
    return JsonResult({ error: 'Token missing' }, 400)
  }

  const googleUserData = await injector.getInstance(GoogleLoginService).getGoogleUserData(token)

  if (!googleUserData.email_verified) {
    logger.warning({
      message: `User '${googleUserData.email}' tried to register with a not-verified e-mail. `,
    })
    return JsonResult({ error: 'Email address not verified' }, 500)
  }

  const existing = await googleAcccounts.search({ filter: { googleId: googleUserData.sub }, top: 1 })

  if (existing && existing.length) {
    return JsonResult({ error: 'Email address already registered.' }, 500)
  }

  const { password, ...newUser } = await userContext.users.add({
    password: '',
    roles: [],
    username: googleUserData.email,
  })

  await googleAcccounts.add({
    googleId: googleUserData.sub,
    googleApiPayload: googleUserData,
    username: googleUserData.email,
  } as GoogleAccount)

  logger.information({
    message: `User ${newUser.username} has been registered with Google Auth.`,
    data: newUser,
  })

  const user = await userContext.cookieLogin(newUser, injector.getResponse())
  return JsonResult({ ...user })
}
