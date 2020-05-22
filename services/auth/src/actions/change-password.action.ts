import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { User } from '@common/models'
import { HttpAuthenticationSettings } from '@furystack/rest-service'
import { StoreManager } from '@furystack/core'

export const ChangePasswordAction: RequestAction<{
  body: { currentPassword: string; newPassword: string }
  result: { success: boolean }
}> = async ({ injector, getBody }) => {
  const currentUser = await injector.getCurrentUser()
  const authSettings = injector.getInstance(HttpAuthenticationSettings)
  const userStore = injector.getInstance(StoreManager).getStoreFor<User & { password: string }>(User)
  const { currentPassword, newPassword } = await getBody()

  const [userToUpdate] = await userStore.find({
    top: 1,
    filter: {
      username: { $eq: currentUser.username },
      password: { $eq: authSettings.hashMethod(currentPassword) },
    },
  })
  if (!userToUpdate) {
    throw new RequestError("Current password doesn't match.", 400)
  }

  await userStore.update(userToUpdate._id, {
    ...userToUpdate,
    password: authSettings.hashMethod(newPassword),
  })

  return JsonResult({ success: true })
}
