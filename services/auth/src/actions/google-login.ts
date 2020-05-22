import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { GoogleLoginService } from '@furystack/auth-google'
import { User, GoogleAccount } from '@common/models'
import { StoreManager } from '@furystack/core'
import { HttpUserContext } from '@furystack/rest-service'

/**
 * HTTP Request action for Google Logins
 */

export const GoogleLoginAction: RequestAction<{ body: { token: string }; result: User }> = async ({
  injector,
  getBody,
  response,
}) => {
  const loginData = await getBody()

  const googleAccountStore = await injector.getInstance(StoreManager).getStoreFor(GoogleAccount)
  const userStore = await injector.getInstance(StoreManager).getStoreFor(User)
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
    delete googleUser[0].password
    return JsonResult({ ...googleUser[0] })
  } else {
    throw new RequestError('No user registered with this Google account.', 400)
  }
}
