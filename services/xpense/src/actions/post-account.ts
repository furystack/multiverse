import { RequestAction, JsonResult } from '@furystack/rest'
import { xpense } from 'common-models'
import { HttpUserContext } from '@furystack/rest-service'

export const PostAccount: RequestAction<{ result: xpense.Account; body: { name: string } }> = async ({
  injector,
  getBody,
}) => {
  const { name } = await getBody()
  const ds = injector.getDataSetFor<xpense.Account>('accounts')
  const currentUser = await injector.getInstance(HttpUserContext).getCurrentUser()

  const created = await ds.add(injector, {
    name,
    ownerType: 'user',
    ownerName: currentUser.username,
    createdBy: currentUser.username,
    creationDate: new Date().toISOString(),
    history: [] as xpense.Account['history'],
    current: 0,
  } as xpense.Account)
  return JsonResult(created)
}
