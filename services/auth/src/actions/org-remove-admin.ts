import { JsonResult, RequestAction, RequestError } from '@furystack/rest'
import { auth } from '@common/models'
import { PartialResult } from '@furystack/core'

export const OrganizationRemoveAdmin: RequestAction<{
  result: PartialResult<auth.Organization, any>
  body: { username: string }
  urlParams: { organizationName: string }
}> = async ({ getBody, getUrlParams, injector }) => {
  const dataSet = injector.getDataSetFor(auth.Organization)

  const user = await injector.getCurrentUser()
  const { username } = await getBody()
  const { organizationName } = getUrlParams()
  const [organization] = await dataSet.find(injector, { filter: { name: { $eq: organizationName } }, top: 1 })

  if (!organization) {
    throw new RequestError('Organization not found', 404)
  }

  if (organization.ownerName !== user.username && !organization.adminNames.includes(user.username)) {
    throw new RequestError('Only owners and admins can modify organization memberships', 401)
  }
  await dataSet.update(injector, organization._id, {
    adminNames: [...new Set(organization.adminNames.filter((u) => u !== username))],
  })
  return JsonResult({ success: true })
}
