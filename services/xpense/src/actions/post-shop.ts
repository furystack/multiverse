import { RequestAction, JsonResult } from '@furystack/rest'
import { xpense } from '@common/models'

export const PostShop: RequestAction<{ result: xpense.Shop; body: { name: string } }> = async ({
  injector,
  getBody,
}) => {
  const postData = await getBody()
  const ds = injector.getDataSetFor<xpense.Shop>('shops')
  const currentUser = await injector.getCurrentUser()

  const { created } = await ds.add(injector, {
    ...postData,
    createdBy: currentUser.username,
    creationDate: new Date().toISOString(),
  })
  return JsonResult(created[0])
}
