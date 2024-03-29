import { extname, join } from 'path'
import { promises } from 'fs'
import { auth } from '@common/models'
import { FileStores } from '@common/config'
import type { Injector } from '@furystack/inject'
import { getLogger } from '@furystack/logging'
import { getDataSetFor } from '@furystack/repository'
import { existsAsync } from './exists-async'

export const saveAvatar = async ({
  tempFilePath,
  user,
  injector,
}: {
  user: auth.User
  tempFilePath: string
  injector: Injector
}) => {
  const logger = getLogger(injector).withScope('saveAvatar')

  const extension = extname(tempFilePath).toLowerCase()
  const fileName = `${user.username}${extension}`
  const fullPath = join(FileStores.avatars, fileName)

  const avatarDirExists = await existsAsync(FileStores.avatars)
  if (!avatarDirExists) {
    await logger.information({
      message: 'Avatar Store path does not exists, trying to create it...',
      data: { path: FileStores.avatars },
    })
    await promises.mkdir(FileStores.avatars, { recursive: true })
  }
  if (user.avatarFile) {
    const oldAvatarPath = join(FileStores.avatars, user.avatarFile)
    const oldAvatarExists = await existsAsync(oldAvatarPath)
    if (oldAvatarExists) {
      await promises.unlink(oldAvatarPath)
    }
  }
  await promises.copyFile(tempFilePath, fullPath)
  await promises.unlink(tempFilePath)
  await getDataSetFor(injector, auth.User, '_id').update(injector, user._id, { avatarFile: fileName })
}
