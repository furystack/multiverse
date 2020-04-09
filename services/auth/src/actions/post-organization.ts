import { RequestAction, JsonResult } from '@furystack/rest'
import { Organization } from '@common/models'
import { HttpUserContext } from '@furystack/rest-service'

export const PostOrganization: RequestAction<{ body: Omit<Organization, '_id'>; result: Organization }> = async ({
  injector,
  getBody,
}) => {
  const dataSet = injector.getDataSetFor<Organization>('organizations')
  const currentUser = await injector.getInstance(HttpUserContext).getCurrentUser()
  const postData = await getBody()
  const result = await dataSet.add(injector, { ...postData, ownerName: currentUser.username } as any)
  return JsonResult(result)
}
