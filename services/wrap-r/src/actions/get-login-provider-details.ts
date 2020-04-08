import { RequestAction, JsonResult } from '@furystack/rest'
import { HttpUserContext } from '@furystack/rest-service'
import { StoreManager } from '@furystack/core'
import { GoogleAccount, GithubAccount, User } from '@common/models'

export const GetLoginProviderDetails: RequestAction<{
  result: {
    hasPassword: boolean
    google?: GoogleAccount
    github?: GithubAccount
  }
}> = async ({ injector }) => {
  const currentUser = await injector.getInstance(HttpUserContext).getCurrentUser()
  const storeManager = injector.getInstance(StoreManager)

  const [loadedUser] = await storeManager
    .getStoreFor(User)
    .search({ top: 1, filter: { username: currentUser.username } })
  const hasPassword = loadedUser.password ? true : false

  const [google] = await storeManager
    .getStoreFor(GoogleAccount)
    .search({ top: 1, filter: { username: currentUser.username } })

  const [github] = await storeManager
    .getStoreFor(GithubAccount)
    .search({ top: 1, filter: { username: currentUser.username } })

  return JsonResult({ hasPassword, google, github })
}
