import { RequestError } from '@furystack/rest'
import type { Fields, Files } from 'formidable'
import { IncomingForm } from 'formidable'
import type { auth } from '@common/models'
import { saveAvatar } from '@common/service-utils'
import { FileStores } from '@common/config'
import type { RequestAction } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest-service'
import { getCurrentUser } from '@furystack/core'

export const UploadAvatar: RequestAction<{ result: { success: boolean } }> = async ({ injector, request }) => {
  const user = (await getCurrentUser(injector)) as auth.User
  const form = new IncomingForm({
    uploadDir: FileStores.tempdir,
  })

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

  await saveAvatar({ injector, user, tempFilePath: file.filepath })

  return JsonResult({ success: true })
}
