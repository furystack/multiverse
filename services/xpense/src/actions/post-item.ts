import { RequestAction, JsonResult } from '@furystack/rest'
import { xpense } from '@common/models'

export const PostItem: RequestAction<{
  result: xpense.Item
  body: { name: string; description: string; category?: string }
}> = async ({ injector, getBody }) => {
  const postData = await getBody()
  const ds = injector.getDataSetFor<xpense.Item>('items')
  const currentUser = await injector.getCurrentUser()

  const created = {
    ...postData,
    createdBy: currentUser.username,
    creationDate: new Date().toISOString(),
  } as xpense.Item
  await ds.add(injector, created)
  return JsonResult(created)
}
