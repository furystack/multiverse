import { JsonResult, RequestAction, RequestError } from '@furystack/rest'
import { auth } from '@common/models'
import { PartialResult } from '@furystack/core'

export const OrganizationAddAdmin: RequestAction<{
  result: PartialResult<auth.Organization, any>
  body: { username: string }
  urlParams: { organizationName: string }
}> = async ({ getBody, getUrlParams, injector }) => {
  const dataSet = injector.getDataSetFor(auth.Organization)

  const { username } = await getBody()
  const { organizationName } = getUrlParams()
  const [organization] = await dataSet.find(injector, { filter: { name: { $eq: organizationName } }, top: 1 })

  if (!organization) {
    throw new RequestError('Organization not found', 404)
  }

  await dataSet.update(injector, organization._id, { adminNames: [...new Set([...organization.adminNames, username])] })
  return JsonResult({ success: true })
}
