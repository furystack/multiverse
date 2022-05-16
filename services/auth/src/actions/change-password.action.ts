import { getCurrentUser } from '@furystack/core'
import { RequestError } from '@furystack/rest'
import { JsonResult, RequestAction } from '@furystack/rest-service'
import { PasswordAuthenticator, UnauthenticatedError } from '@furystack/security'

export const ChangePasswordAction: RequestAction<{
  body: { currentPassword: string; newPassword: string }
  result: { success: boolean }
}> = async ({ injector, getBody }) => {
  const currentUser = await getCurrentUser(injector)

  const { currentPassword, newPassword } = await getBody()
  try {
    await injector
      .getInstance(PasswordAuthenticator)
      .setPasswordForUser(currentUser.username, currentPassword, newPassword)
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      throw new RequestError("Current password doesn't match.", 400)
    } else {
      throw error
    }
  }

  return JsonResult({ success: true })
}
