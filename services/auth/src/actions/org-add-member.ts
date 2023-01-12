import { RequestError } from '@furystack/rest'
import { auth } from '@common/models'
import type { RequestAction } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest-service'
import { getDataSetFor } from '@furystack/repository'

export const OrganizationAddMember: RequestAction<{
  result: { success: boolean }
  body: { username: string }
  url: { organizationName: string }
}> = async ({ getBody, getUrlParams, injector }) => {
  const dataSet = getDataSetFor(injector, auth.Organization, '_id')

  const { username } = await getBody()
  const { organizationName } = getUrlParams()
  const [organization] = await dataSet.find(injector, { filter: { name: { $eq: organizationName } }, top: 1 })

  if (!organization) {
    throw new RequestError('Organization not found', 404)
  }

  await dataSet.update(injector, organization._id, {
    memberNames: [...new Set([...organization.memberNames, username])],
  })
  return JsonResult({ success: true })
}
