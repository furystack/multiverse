import { RequestAction, JsonResult } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { auth } from '@common/models'

export const GetLoginProviderDetails: RequestAction<{
  result: {
    hasPassword: boolean
    google?: auth.GoogleAccount
    github?: auth.GithubAccount
  }
}> = async ({ injector }) => {
  const currentUser = await injector.getCurrentUser()
  const storeManager = injector.getInstance(StoreManager)

  const [loadedUser] = await storeManager
    .getStoreFor(auth.User)
    .find({ top: 1, filter: { username: { $eq: currentUser.username } } })
  const hasPassword = loadedUser.password ? true : false

  const [google] = await storeManager
    .getStoreFor(auth.GoogleAccount)
    .find({ top: 1, filter: { username: { $eq: currentUser.username } } })

  const [github] = await storeManager
    .getStoreFor(auth.GithubAccount)
    .find({ top: 1, filter: { username: { $eq: currentUser.username } } })

  return JsonResult({ hasPassword, google, github })
}
