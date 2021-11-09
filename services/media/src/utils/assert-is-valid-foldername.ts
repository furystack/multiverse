import { delimiter } from 'path'

export const assertIsValidFolderName = (folderName: string | string[]) => {
  if (folderName instanceof Array || folderName.includes('..') || folderName.includes(delimiter)) {
    throw new Error(`Invalid folder name: '${folderName}'`)
  }
}
