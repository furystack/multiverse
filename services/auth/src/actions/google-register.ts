import { RequestError } from '@furystack/rest'
import { GoogleLoginService } from '@furystack/auth-google'
import { StoreManager } from '@furystack/core'
import { auth } from '@common/models'
import type { RequestAction } from '@furystack/rest-service'
import { HttpUserContext, JsonResult } from '@furystack/rest-service'
import { downloadAsTempFile, saveAvatar } from '@common/service-utils'
import { getLogger } from '@furystack/logging'

/**
 * HTTP Request action for Google Logins
 */

export const GoogleRegisterAction: RequestAction<{
  body: { token: string }
  result: Omit<auth.User, 'password'>
}> = async ({ injector, getBody, response }) => {
  const logger = getLogger(injector).withScope('GoogleRegisterAction')
  const storeManager = injector.getInstance(StoreManager)
  const userContext = injector.getInstance(HttpUserContext)
  const googleAcccounts = storeManager.getStoreFor(auth.GoogleAccount, '_id')
  const users = storeManager.getStoreFor(auth.User, '_id')
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

  const { created } = await users.add({
    roles: ['terms-accepted'],
    registrationDate,
    username: googleUserData.email,
  })

  const userToAdd = created[0]

  try {
    const tempFilePath = googleUserData && googleUserData.picture && (await downloadAsTempFile(googleUserData.picture))
    tempFilePath && (await saveAvatar({ injector, user: userToAdd, tempFilePath }))
  } catch (error) {
    await logger.warning({ message: 'Failed to get Avatar', data: { error } })
  }
  await googleAcccounts.add({
    googleId: googleUserData.sub,
    googleApiPayload: googleUserData,
    username: googleUserData.email,
    accountLinkDate: registrationDate,
  })

  await storeManager.getStoreFor(auth.Profile, '_id').add({
    username: userToAdd.username,
    displayName: googleUserData.name,
    description: '',
    userSettings: {
      theme: 'dark',
    },
  })

  await logger.information({
    message: `User ${userToAdd.username} has been registered with Google Auth.`,
    data: userToAdd,
  })

  const user = (await userContext.cookieLogin(userToAdd, response)) as auth.User
  return JsonResult(user)
}
