import { auth } from '@common/models'
import { getCurrentUser, StoreManager } from '@furystack/core'
import { getLogger } from '@furystack/logging'
import { RequestAction, JsonResult } from '@furystack/rest-service'

export const AcceptTermsAction: RequestAction<{ result: { success: boolean } }> = async ({ injector }) => {
  const user = (await getCurrentUser(injector)) as auth.User
  if (!user.roles.includes('terms-accepted')) {
    await injector
      .getInstance(StoreManager)
      .getStoreFor(auth.User, '_id')
      .update(user._id, { roles: [...user.roles, 'terms-accepted'] })
  }
  await getLogger(injector)
    .withScope('accept-terms')
    .information({
      message: `The User '${user.username}' has been accepted the terms`,
      data: { ...user },
    })
  return JsonResult({ success: true })
}
