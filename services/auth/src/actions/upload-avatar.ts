import { RequestError } from '@furystack/rest'
import { IncomingForm, Fields, Files } from 'formidable'
import { auth } from '@common/models'
import { saveAvatar } from '@common/service-utils'
import { FileStores } from '@common/config'
import { RequestAction, JsonResult } from '@furystack/rest-service'

export const UploadAvatar: RequestAction<{ result: { success: boolean } }> = async ({ injector, request }) => {
  const user = await injector.getCurrentUser<auth.User>()
  const form = new IncomingForm()
  form.uploadDir = FileStores.tempdir

  const parseResult = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) =>
    form.parse(request, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      resolve({ fields, files })
    }),
  )

  const file = parseResult.files.avatar

  if (file instanceof Array) {
    throw new RequestError('Multiple files are not supported', 400)
  }

  if (!file) {
    throw new RequestError('No avatar file', 400)
  }

  await saveAvatar({ injector, user, tempFilePath: file.path })

  return JsonResult({ success: true })
}
