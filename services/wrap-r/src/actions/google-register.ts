import { RequestAction, JsonResult } from '@furystack/rest'
import { GoogleLoginService } from '@furystack/auth-google'
import { StoreManager } from '@furystack/core'
import { User, GoogleAccount } from 'common-models'
import { HttpUserContext } from '@furystack/rest-service'

/**
 * HTTP Request action for Google Logins
 */

export const GoogleRegisterAction: RequestAction<{ body: { token: string } }> = async ({ injector, getBody }) => {
  const logger = injector.logger.withScope('GoogleRegisterAction')

  const userContext = injector.getInstance(HttpUserContext)
  const googleAcccounts = injector.getInstance(StoreManager).getStoreFor(GoogleAccount)
  const users = injector.getInstance(StoreManager).getStoreFor(User)
  const { token } = await getBody()
  const registrationDate = new Date().toISOString()

  if (!token) {
    return JsonResult({ error: 'Token missing' }, 400)
  }

  const googleUserData = await injector.getInstance(GoogleLoginService).getGoogleUserData(token)

  if (!googleUserData.email_verified) {
    logger.warning({
      message: `User '${googleUserData.email}' tried to register with a not-verified e-mail. `,
    })
    return JsonResult({ error: 'Email address for account not verified' }, 500)
  }

  const existing = await googleAcccounts.search({ filter: { googleId: { $eq: googleUserData.sub } }, top: 1 })

  if (existing && existing.length) {
    return JsonResult({ error: 'Google account already registered.' }, 500)
  }

  const { password, ...newUser } = await users.add({
    password: '',
    roles: ['terms-accepted'],
    registrationDate,
    username: googleUserData.email,
    avatarUrl: googleUserData.picture,
  } as User)

  await googleAcccounts.add({
    googleId: googleUserData.sub,
    googleApiPayload: googleUserData,
    username: googleUserData.email,
    accountLinkDate: registrationDate,
  } as GoogleAccount)

  logger.information({
    message: `User ${newUser.username} has been registered with Google Auth.`,
    data: newUser,
  })

  const user = await userContext.cookieLogin(newUser, injector.getResponse())
  return JsonResult({ ...user })
}
