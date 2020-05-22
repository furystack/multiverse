import { RequestAction, JsonResult } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { GoogleAccount, GithubAccount, User } from '@common/models'

export const GetLoginProviderDetails: RequestAction<{
  result: {
    hasPassword: boolean
    google?: GoogleAccount
    github?: GithubAccount
  }
}> = async ({ injector }) => {
  const currentUser = await injector.getCurrentUser()
  const storeManager = injector.getInstance(StoreManager)

  const [loadedUser] = await storeManager
    .getStoreFor(User)
    .find({ top: 1, filter: { username: { $eq: currentUser.username } } })
  const hasPassword = loadedUser.password ? true : false

  const [google] = await storeManager
    .getStoreFor(GoogleAccount)
    .find({ top: 1, filter: { username: { $eq: currentUser.username } } })

  const [github] = await storeManager
    .getStoreFor(GithubAccount)
    .find({ top: 1, filter: { username: { $eq: currentUser.username } } })

  return JsonResult({ hasPassword, google, github })
}
