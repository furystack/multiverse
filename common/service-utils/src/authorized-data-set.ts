import { Injector } from '@furystack/inject'
import { HttpUserContext } from '@furystack/rest-service'
import { DataSetSettings } from '@furystack/repository'

export const authorizedOnly = async (options: { injector: Injector }) => {
  const authorized = await options.injector.getInstance(HttpUserContext).isAuthenticated()
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
