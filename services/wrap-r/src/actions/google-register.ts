import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { GoogleLoginService } from '@furystack/auth-google'
import { StoreManager } from '@furystack/core'
import { User, GoogleAccount, Profile } from '@common/models'
import { HttpUserContext } from '@furystack/rest-service'

/**
 * HTTP Request action for Google Logins
 */

export const GoogleRegisterAction: RequestAction<{ body: { token: string }; result: User }> = async ({
  injector,
  getBody,
}) => {
  const logger = injector.logger.withScope('GoogleRegisterAction')
  const storeManager = injector.getInstance(StoreManager)
  const userContext = injector.getInstance(HttpUserContext)
  const googleAcccounts = storeManager.getStoreFor(GoogleAccount)
  const users = storeManager.getStoreFor(User)
  const { token } = await getBody()
  const registrationDate = new Date().toISOString()

  if (!token) {
    throw new RequestError('Token missing', 400)
  }

  const googleUserData = await injector.getInstance(GoogleLoginService).getGoogleUserData(token)

  if (!googleUserData.email_verified) {
    logger.warning({
      message: `User '${googleUserData.email}' tried to register with a not-verified e-mail. `,
    })
    throw new RequestError('Email address for account not verified', 401)
  }

  const existing = await googleAcccounts.search({ filter: { googleId: { $eq: googleUserData.sub } }, top: 1 })

  if (existing && existing.length) {
    throw new RequestError('Google account already registered.', 401)
  }

  const { password, ...newUser } = await users.add({
    password: '',
    roles: ['terms-accepted'],
    registrationDate,
    username: googleUserData.email,
  } as User)

  await googleAcccounts.add({
    googleId: googleUserData.sub,
    googleApiPayload: googleUserData,
    username: googleUserData.email,
    accountLinkDate: registrationDate,
  } as GoogleAccount)

  await storeManager
    .getStoreFor(Profile)
    .add({ username: newUser.username, displayName: googleUserData.name, avatarUrl: googleUserData.picture } as Profile)

  logger.information({
    message: `User ${newUser.username} has been registered with Google Auth.`,
    data: newUser,
  })

  const user = await userContext.cookieLogin(newUser, injector.getResponse())
  return JsonResult(user as User)
}
