import { createWriteStream } from 'fs'
import { join } from 'path'
import { get } from 'https'
import { FileStores } from '@common/config'
import { v4 } from 'uuid'

export const downloadAsTempFile = async (url: string) => {
  const filePath = join(FileStores.tempdir, v4())
  const file = createWriteStream(filePath)
  return await new Promise<string>((resolve, reject) => {
    get(url, (response) => {
      response.pipe(file)
      response.on('close', () => resolve(filePath))
      response.on('error', (err) => reject(err))
    })
  })
}
