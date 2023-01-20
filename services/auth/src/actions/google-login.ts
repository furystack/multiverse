import { RequestError } from '@furystack/rest'
import { GoogleLoginService } from '@furystack/auth-google'
import { auth } from '@common/models'
import { StoreManager } from '@furystack/core'
import type { RequestAction } from '@furystack/rest-service'
import { HttpUserContext, JsonResult } from '@furystack/rest-service'

/**
 * HTTP Request action for Google Logins
 */

export const GoogleLoginAction: RequestAction<{
  body: { token: string }
  result: Omit<auth.User, 'password'>
}> = async ({ injector, getBody, response }) => {
  const loginData = await getBody()

  const googleAccountStore = await injector.getInstance(StoreManager).getStoreFor(auth.GoogleAccount, '_id')
  const userStore = await injector.getInstance(StoreManager).getStoreFor(auth.User, '_id')
  const googleUserData = await injector.getInstance(GoogleLoginService).getGoogleUserData(loginData.token)
  if (!googleUserData.email_verified) {
    throw new RequestError('Email address for account not verified', 401)
  }
  const googleAccount = await googleAccountStore.find({ filter: { googleId: { $eq: googleUserData.sub } } })
  if (googleAccount.length === 1) {
    const googleUser = await userStore.find({ top: 2, filter: { username: { $eq: googleAccount[0].username } } })
    if (googleUser.length !== 1) {
      throw new RequestError(`Found ${googleUser.length} user(s) with the username '${googleAccount[0].username}'`, 500)
    }
    await injector.getInstance(HttpUserContext).cookieLogin(googleUser[0], response)
    const user = googleUser[0]

    return JsonResult(user)
  } else {
    throw new RequestError('No user registered with this Google account.', 400)
  }
}
