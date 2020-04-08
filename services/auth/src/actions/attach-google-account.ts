import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { GoogleLoginService } from '@furystack/auth-google'
import { StoreManager } from '@furystack/core'
import { User, GoogleAccount } from '@common/models'
import { HttpUserContext } from '@furystack/rest-service'

/**
 * HTTP Request action for Google Logins
 */

export const AttachGoogleAccountAction: RequestAction<{ body: { token: string }; result: User }> = async ({
  injector,
  getBody,
}) => {
  const logger = injector.logger.withScope('AttachGoogleAccountAction')

  const currentUser = await injector.getInstance(HttpUserContext).getCurrentUser()
  const googleAcccounts = injector.getInstance(StoreManager).getStoreFor(GoogleAccount)
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

  const googleAccount = await googleAcccounts.add({
    googleId: googleUserData.sub,
    googleApiPayload: googleUserData,
    username: currentUser.username,
    accountLinkDate: registrationDate,
  } as GoogleAccount)

  logger.information({
    message: `User ${currentUser.username} has attached a Google account.`,
    data: { user: currentUser, googleAccount },
  })

  return JsonResult(currentUser as User)
}
