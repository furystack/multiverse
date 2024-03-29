import { isAuthenticated } from '@furystack/core'
import type { Injector } from '@furystack/inject'
import type { DataSetSettings } from '@furystack/repository'

export const authorizedOnly = async (options: { injector: Injector }) => {
  const authorized = await isAuthenticated(options.injector)
  return {
    isAllowed: authorized,
    message: 'You are not authorized :(',
  }
}

export const authorizedDataSet: Partial<DataSetSettings<any, any>> = {
  authorizeAdd: authorizedOnly,
  authorizeGet: authorizedOnly,
  authorizeRemove: authorizedOnly,
  authorizeUpdate: authorizedOnly,
  authroizeRemoveEntity: authorizedOnly,
}
