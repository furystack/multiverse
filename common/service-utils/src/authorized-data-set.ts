import { Injector } from '@furystack/inject'
import { DataSetSettings } from '@furystack/repository'

export const authorizedOnly = async (options: { injector: Injector }) => {
  const authorized = await options.injector.isAuthenticated()
  return {
    isAllowed: authorized,
    message: 'You are not authorized :(',
  }
}

export const authorizedDataSet: Partial<DataSetSettings<any>> = {
  authorizeAdd: authorizedOnly,
  authorizeGet: authorizedOnly,
  authorizeRemove: authorizedOnly,
  authorizeUpdate: authorizedOnly,
  authroizeRemoveEntity: authorizedOnly,
}
