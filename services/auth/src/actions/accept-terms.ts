import { auth } from '@common/models'
import { StoreManager } from '@furystack/core'
import { RequestAction, JsonResult } from '@furystack/rest-service'

export const AcceptTermsAction: RequestAction<{ result: { success: boolean } }> = async ({ injector }) => {
  const user = await injector.getCurrentUser<auth.User>()
  if (!user.roles.includes('terms-accepted')) {
    await injector
      .getInstance(StoreManager)
      .getStoreFor(auth.User)
      .update(user._id, { roles: [...user.roles, 'terms-accepted'] })
  }
  await injector.logger.withScope('accept-terms').information({
    message: `The User '${user.username}' has been accepted the terms`,
    data: { ...user },
  })
  return JsonResult({ success: true })
}
