import { RequestAction, JsonResult } from '@furystack/rest'
import { xpense } from 'common-models'
import { HttpUserContext } from '@furystack/rest-service'

export const PostShop: RequestAction<{ result: xpense.Shop; body: { name: string } }> = async ({
  injector,
  getBody,
}) => {
  const postData = await getBody()
  const ds = injector.getDataSetFor<xpense.Shop>('shops')
  const currentUser = await injector.getInstance(HttpUserContext).getCurrentUser()

  const created = await ds.add(injector, {
    ...postData,
    createdBy: currentUser.username,
    creationDate: new Date().toISOString(),
  } as xpense.Shop)
  return JsonResult(created)
}
