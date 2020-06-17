import { join, extname } from 'path'
import { promises, existsSync } from 'fs'
import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { IncomingForm, Fields, Files } from 'formidable'
import { FileStores } from '@common/config'
import { auth } from '@common/models'

export const UploadAvatar: RequestAction<{}> = async ({ injector, request }) => {
  const user = await injector.getCurrentUser<auth.User>()
  const form = new IncomingForm()

  const parseResult = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) =>
    form.parse(request, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      resolve({ fields, files })
    }),
  )

  const file = parseResult.files.avatar
  if (!file) {
    throw new RequestError('No avatar file', 400)
  }

  const extension = extname(file.name).toLowerCase()
  const fileName = `${user.username}${extension}`
  const fullPath = join(FileStores.avatars, fileName)

  if (user.avatarFile) {
    const oldAvatarPath = join(FileStores.avatars, user.avatarFile)
    if (existsSync(oldAvatarPath)) {
      await promises.unlink(oldAvatarPath)
    }
  }

  await promises.copyFile(file.path, fullPath)

  // Remove from temp
  promises.unlink(file.path)
  injector.getDataSetFor(auth.User).update(injector, user._id, { avatarFile: fileName })

  return JsonResult({ success: true })
}
