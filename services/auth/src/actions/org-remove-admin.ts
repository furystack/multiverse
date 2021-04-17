import { RequestError } from '@furystack/rest'
import { auth } from '@common/models'
import { JsonResult, RequestAction } from '@furystack/rest-service'

export const OrganizationRemoveAdmin: RequestAction<{
  result: { success: boolean }
  body: { username: string }
  url: { organizationName: string }
}> = async ({ getBody, getUrlParams, injector }) => {
  const dataSet = injector.getDataSetFor(auth.Organization)

  const { username } = await getBody()
  const { organizationName } = getUrlParams()
  const [organization] = await dataSet.find(injector, { filter: { name: { $eq: organizationName } }, top: 1 })

  if (!organization) {
    throw new RequestError('Organization not found', 404)
  }

  await dataSet.update(injector, organization._id, {
    adminNames: [...new Set(organization.adminNames.filter((u) => u !== username))],
  })
  return JsonResult({ success: true })
}
