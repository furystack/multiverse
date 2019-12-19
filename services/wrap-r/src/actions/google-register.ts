import { HttpUserContext, RequestAction, JsonResult } from '@furystack/http-api'
import { GoogleLoginService } from '@furystack/auth-google'

/**
 * HTTP Request action for Google Logins
 */

export const GoogleRegisterAction: RequestAction = async injector => {
  const logger = injector.logger.withScope('GoogleRegisterAction')

  const userContext = injector.getInstance(HttpUserContext)
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

  const existing = await userContext.users.get(googleUserData.email)

  if (existing) {
    return JsonResult({ error: 'Email address already registered.' }, 500)
  }

  const { password, ...newUser } = await userContext.users.add({
    password: '',
    roles: [],
    username: googleUserData.email,
  })

  logger.information({
    message: `User ${newUser.username} has been registered with Google Auth.`,
    data: newUser,
  })

  const user = await userContext.externalLogin(GoogleLoginService, injector.getResponse(), token)
  return JsonResult({ ...user })
}
