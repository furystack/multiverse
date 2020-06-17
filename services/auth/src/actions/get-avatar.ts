import { join } from 'path'
import { createReadStream, existsSync } from 'fs'
import { RequestAction, RequestError, BypassResult } from '@furystack/rest'
import { auth } from '@common/models'
import { FileStores } from '@common/config'
import { StoreManager } from '@furystack/core'

export const GetAvatar: RequestAction<{
  result: string
  urlParams: { username: string }
}> = async ({ injector, getUrlParams, response }) => {
  const userStore = injector.getInstance(StoreManager).getStoreFor(auth.User)
  const { username } = getUrlParams()

  const [user] = await userStore.find({ filter: { username: { $eq: username } }, top: 1 })
  if (user) {
    const profileImage = join(FileStores.avatars, `${user.avatarFile}`)
    if (existsSync(profileImage)) {
      createReadStream(profileImage).pipe(response)
      return BypassResult()
    }
  }

  throw new RequestError(`The profile for user '${username}' does not exists`, 404)
}
