import { RequestAction, JsonResult } from '@furystack/rest'
import { xpense } from '@common/models'

export const PostItem: RequestAction<{
  result: xpense.Item
  body: { name: string; description: string; category?: string }
}> = async ({ injector, getBody }) => {
  const postData = await getBody()
  const ds = injector.getDataSetFor<xpense.Item>('items')
  const currentUser = await injector.getCurrentUser()

  const created = await ds.add(injector, {
    ...postData,
    createdBy: currentUser.username,
    creationDate: new Date().toISOString(),
  } as xpense.Item)
  return JsonResult(created)
}
