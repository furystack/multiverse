import { RequestError } from '@furystack/rest'
import { GoogleLoginService } from '@furystack/auth-google'
import { getCurrentUser, StoreManager } from '@furystack/core'
import { auth } from '@common/models'
import type { RequestAction } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest-service'
import { getLogger } from '@furystack/logging'

/**
 * HTTP Request action for Google Logins
 */

export const AttachGoogleAccountAction: RequestAction<{
  body: { token: string }
  result: Omit<auth.User, 'password'>
}> = async ({ injector, getBody }) => {
  const logger = getLogger(injector).withScope('AttachGoogleAccountAction')

  const currentUser = (await getCurrentUser(injector)) as auth.User
  const googleAcccounts = injector.getInstance(StoreManager).getStoreFor(auth.GoogleAccount, '_id')
  const { token } = await getBody()
  const registrationDate = new Date().toISOString()

  if (!token) {
    throw new RequestError('Token missing', 400)
  }

  const googleUserData = await injector.getInstance(GoogleLoginService).getGoogleUserData(token)

  if (!googleUserData.email_verified) {
    await logger.warning({
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

  await logger.information({
    message: `User ${currentUser.username} has attached a Google account.`,
    data: { user: currentUser, googleAccount: created[0] },
  })

  return JsonResult(currentUser as auth.User)
}
