import { RequestAction, JsonResult } from '@furystack/rest'
import { xpense } from 'common-models'
import { HttpUserContext } from '@furystack/rest-service'

export const PostItem: RequestAction<{
  result: xpense.Item
  body: { name: string; description: string; category?: string }
}> = async ({ injector, getBody }) => {
  const postData = await getBody()
  const ds = injector.getDataSetFor<xpense.Item>('items')
  const currentUser = await injector.getInstance(HttpUserContext).getCurrentUser()

  const created = await ds.add(injector, {
    ...postData,
    createdBy: currentUser.username,
    creationDate: new Date().toISOString(),
  } as xpense.Item)
  return JsonResult(created)
}