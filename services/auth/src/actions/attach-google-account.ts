import { RequestError } from '@furystack/rest'
import { GoogleLoginService } from '@furystack/auth-google'
import { StoreManager } from '@furystack/core'
import { auth } from '@common/models'
import { RequestAction, JsonResult } from '@furystack/rest-service'

/**
 * HTTP Request action for Google Logins
 */

export const AttachGoogleAccountAction: RequestAction<{
  body: { token: string }
  result: Omit<auth.User, 'password'>
}> = async ({ injector, getBody }) => {
  const logger = injector.logger.withScope('AttachGoogleAccountAction')

  const { password, ...currentUser } = (await injector.getCurrentUser()) as auth.User
  const googleAcccounts = injector.getInstance(StoreManager).getStoreFor(auth.GoogleAccount, '_id')
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

  const existing = await googleAcccounts.find({ filter: { googleId: { $eq: googleUserData.sub } }, top: 1 })

  if (existing && existing.length) {
    throw new RequestError('Google account already registered.', 401)
  }

  const { created } = await googleAcccounts.add({
    googleId: googleUserData.sub,
    googleApiPayload: googleUserData,
    username: currentUser.username,
    accountLinkDate: registrationDate,
  })

  logger.information({
    message: `User ${currentUser.username} has attached a Google account.`,
    data: { user: currentUser, googleAccount: created[0] },
  })

  return JsonResult(currentUser as auth.User)
}
