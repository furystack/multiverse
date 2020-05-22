import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { Organization } from '@common/models'
import { PartialResult } from '@furystack/core'

export const GetOrganization: RequestAction<{
  result: PartialResult<Organization, any>
  urlParams: { organizationName: string }
}> = async ({ injector, getUrlParams }) => {
  const profileStore = injector.getDataSetFor<Organization>('organizations')
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
