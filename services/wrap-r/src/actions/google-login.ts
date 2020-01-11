import { RequestAction, JsonResult, HttpUserContext } from '@furystack/http-api'
import { GoogleLoginService } from '@furystack/auth-google'
import { User } from 'common-service-utils'
import { StoreManager } from '@furystack/core'
import { GoogleAccount } from '../models'

/**
 * HTTP Request action for Google Logins
 */

export const GoogleLoginAction: RequestAction = async injector => {
  const loginData = await injector.getRequest().readPostBody<{ token: string }>()

  const googleAccountStore = await injector.getInstance(StoreManager).getStoreFor(GoogleAccount)
  const userStore = await injector.getInstance(StoreManager).getStoreFor(User)

  try {
    const googleUserData = await injector.getInstance(GoogleLoginService).getGoogleUserData(loginData.token)
    if (!googleUserData.email_verified) {
      return JsonResult({ error: 'Email address not verified' }, 400)
    }
    const googleAccount = await googleAccountStore.search({ filter: { googleId: googleUserData.sub } })
    if (googleAccount.length === 1) {
      const googleUser = await userStore.search({ top: 2, filter: { username: googleAccount[0].username } })
      if (googleUser.length !== 1) {
        return JsonResult(
          { error: `Found ${googleUser.length} user(s) with the username '${googleAccount[0].username}'` },
          500,
        )
      }
      await injector.getInstance(HttpUserContext).cookieLogin(googleUser[0], injector.getResponse())
      delete googleUser[0].password
      return JsonResult({ ...googleUser[0] })
    } else {
      return JsonResult({ error: 'No user registered with this Google account.' }, 400)
    }
  } catch (error) {
    return JsonResult({ error: error.toString() }, 400)
  }
}
