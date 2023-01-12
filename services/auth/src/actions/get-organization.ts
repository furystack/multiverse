import { RequestError } from '@furystack/rest'
import { auth } from '@common/models'
import type { RequestAction } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest-service'
import { getDataSetFor } from '@furystack/repository'

export const GetOrganization: RequestAction<{
  result: auth.Organization
  url: { organizationName: string }
}> = async ({ injector, getUrlParams }) => {
  const profileStore = getDataSetFor(injector, auth.Organization, '_id')
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
