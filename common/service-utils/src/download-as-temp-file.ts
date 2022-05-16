import { createWriteStream } from 'fs'
import { join } from 'path'
import { get } from 'https'
import { FileStores } from '@common/config'
import { getRandomString } from '@common/models'

export const downloadAsTempFile = async (url: string) => {
  const filePath = join(FileStores.tempdir, getRandomString())
  const file = createWriteStream(filePath)
  return await new Promise<string>((resolve, reject) => {
    get(url, (response) => {
      response.pipe(file)
      response.on('close', () => resolve(filePath))
      response.on('error', (err) => reject(err))
    })
  })
}
