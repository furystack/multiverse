import { RequestError } from '@furystack/rest'
import { auth } from '@common/models'
import type { RequestAction } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest-service'
import { getDataSetFor } from '@furystack/repository'

export const PatchOrganization: RequestAction<{
  body: Partial<auth.Organization>
  result: auth.Organization
  url: { organizationName: string }
}> = async ({ injector, getBody, getUrlParams }) => {
  const dataSet = getDataSetFor(injector, auth.Organization, '_id')
  const { organizationName } = getUrlParams()
  const patchData = await getBody()
  const [existing] = await dataSet.find(injector, { top: 1, filter: { name: { $eq: organizationName } } })

  if (!existing) {
    throw new RequestError(`Organization with name '${organizationName}' does not exists`, 404)
  }
  await dataSet.update(injector, existing._id, patchData as any)
  return JsonResult({ ...existing, ...patchData })
}
