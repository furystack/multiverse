import { RequestAction, JsonResult } from '@furystack/rest'
import { Organization } from '@common/models'

export const PostOrganization: RequestAction<{ body: Omit<Organization, '_id'>; result: Organization }> = async ({
  injector,
  getBody,
}) => {
  const dataSet = injector.getDataSetFor<Organization>('organizations')
  const currentUser = await injector.getCurrentUser()
  const postData = await getBody()
  const { created } = await dataSet.add(injector, { ...postData, ownerName: currentUser.username })
  return JsonResult(created[0])
}
