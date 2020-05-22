import { RequestAction, JsonResult } from '@furystack/rest'
import { xpense } from '@common/models'

export const PostAccount: RequestAction<{
  result: xpense.Account
  body: { name: string; description: string; icon: string }
}> = async ({ injector, getBody }) => {
  const { name, description, icon } = await getBody()
  const ds = injector.getDataSetFor<xpense.Account>('accounts')
  const currentUser = await injector.getCurrentUser()

  const created = {
    name,
    description,
    icon,
    ownerType: 'user',
    ownerName: currentUser.username,
    createdBy: currentUser.username,
    creationDate: new Date().toISOString(),
    history: [] as xpense.Account['history'],
    current: 0,
  } as xpense.Account

  await ds.add(injector, created)
  return JsonResult(created)
}
