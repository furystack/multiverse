import { join } from 'path'
import { createReadStream } from 'fs'
import { RequestError } from '@furystack/rest'
import { auth } from '@common/models'
import { FileStores } from '@common/config'
import { StoreManager } from '@furystack/core'
import { existsAsync } from '@common/service-utils'
import { BypassResult, RequestAction } from '@furystack/rest-service'

export const GetAvatar: RequestAction<{
  result: unknown
  url: { username: string }
}> = async ({ injector, getUrlParams, response }) => {
  const userStore = injector.getInstance(StoreManager).getStoreFor(auth.User, '_id')
  const { username } = getUrlParams()

  const [user] = await userStore.find({ filter: { username: { $eq: username } }, top: 1 })
  if (user) {
    const profileImage = join(FileStores.avatars, `${user.avatarFile}`)
    const hasProfileImage = await existsAsync(profileImage)
    if (hasProfileImage) {
      createReadStream(profileImage).pipe(response)
      return BypassResult()
    }
  }

  throw new RequestError(`The avatar for user '${username}' does not exists`, 404)
}
