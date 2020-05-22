import { RequestAction, JsonResult } from '@furystack/rest'
import { Organization } from '@common/models'

export const PostOrganization: RequestAction<{ body: Omit<Organization, '_id'>; result: Organization }> = async ({
  injector,
  getBody,
}) => {
  const dataSet = injector.getDataSetFor<Organization>('organizations')
  const currentUser = await injector.getCurrentUser()
  const postData = await getBody()
  const newOrg = { ...postData, ownerName: currentUser.username } as Organization
  await dataSet.add(injector, newOrg)
  return JsonResult(newOrg)
}
