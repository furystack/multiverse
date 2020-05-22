import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { Organization } from '@common/models'

export const PatchOrganization: RequestAction<{
  body: Partial<Organization>
  result: Organization
  urlParams: { organizationName: string }
}> = async ({ injector, getBody, getUrlParams }) => {
  const dataSet = injector.getDataSetFor(Organization)
  const { organizationName } = getUrlParams()
  const patchData = await getBody()
  const [existing] = await dataSet.find(injector, { top: 1, filter: { name: { $eq: organizationName } } })

  if (!existing) {
    throw new RequestError(`Organization with name '${organizationName}' does not exists`, 404)
  }
  await dataSet.update(injector, existing._id, patchData as any)
  return JsonResult({ ...existing, ...patchData })
}
