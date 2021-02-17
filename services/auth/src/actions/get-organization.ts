import { RequestError } from '@furystack/rest'
import { auth } from '@common/models'
import { PartialResult } from '@furystack/core'
import { JsonResult, RequestAction } from '@furystack/rest-service'

export const GetOrganization: RequestAction<{
  result: PartialResult<auth.Organization, any>
  url: { organizationName: string }
}> = async ({ injector, getUrlParams }) => {
  const profileStore = injector.getDataSetFor(auth.Organization)
  const { organizationName } = getUrlParams()
  const result = await profileStore.find(injector, {
    filter: {
      name: { $eq: organizationName },
    },
    top: 1,
  })
  const profile = result[0]
  if (!profile) {
    throw new RequestError(`The organization with name '${organizationName}' does not exists`, 404)
  }
  return JsonResult(profile)
}
