import { promises } from 'fs'

export const existsAsync = async (path: string, mode?: number) => {
  try {
    await promises.access(path, mode)
  } catch {
    return false
  }
  return true
}
