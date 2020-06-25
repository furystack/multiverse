import { extname, join } from 'path'
import { existsSync, promises } from 'fs'
import { auth } from '@common/models'
import { FileStores } from '@common/config'
import { Injector } from '@furystack/inject'

export const saveAvatar = async ({
  tempFilePath,
  user,
  injector,
}: {
  user: auth.User
  tempFilePath: string
  injector: Injector
}) => {
  const logger = injector.logger.withScope('saveAvatar')

  const extension = extname(tempFilePath).toLowerCase()
  const fileName = `${user.username}${extension}`
  const fullPath = join(FileStores.avatars, fileName)

  if (!existsSync(FileStores.avatars)) {
    logger.information({
      message: 'Avatar Store path does not exists, trying to create it...',
      data: { path: FileStores.avatars },
    })
    await promises.mkdir(FileStores.avatars, { recursive: true })
  }
  if (user.avatarFile) {
    const oldAvatarPath = join(FileStores.avatars, user.avatarFile)
    if (existsSync(oldAvatarPath)) {
      await promises.unlink(oldAvatarPath)
    }
  }
  await promises.copyFile(tempFilePath, fullPath)
  // Remove from temp file
  promises.unlink(tempFilePath)
  await injector.getDataSetFor(auth.User).update(injector, user._id, { avatarFile: fileName })
}
