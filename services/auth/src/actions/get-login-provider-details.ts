import type { RequestAction } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest-service'
import { getCurrentUser, StoreManager } from '@furystack/core'
import { PasswordCredential } from '@furystack/security'
import { auth } from '@common/models'

export const GetLoginProviderDetails: RequestAction<{
  result: {
    hasPassword: boolean
    google?: auth.GoogleAccount
    github?: auth.GithubAccount
  }
}> = async ({ injector }) => {
  const currentUser = await getCurrentUser(injector)
  const storeManager = injector.getInstance(StoreManager)

  const hasPassword = (await storeManager.getStoreFor(PasswordCredential, 'userName').get(currentUser.username))
    ? true
    : false

  const [google] = await storeManager
    .getStoreFor(auth.GoogleAccount, '_id')
    .find({ top: 1, filter: { username: { $eq: currentUser.username } } })

  const [github] = await storeManager
    .getStoreFor(auth.GithubAccount, '_id')
    .find({ top: 1, filter: { username: { $eq: currentUser.username } } })

  return JsonResult({ hasPassword, google, github })
}
