import { RequestAction, JsonResult } from '@furystack/rest'
import { xpense } from 'common-models'

export const GetAvailableAccounts: RequestAction<{
  result: Array<{ name: string; ownerType: xpense.Account['ownerType']; ownerName: xpense.Account['ownerName'] }>
}> = async ({ injector }) => {
  const ds = injector.getDataSetFor<xpense.Account>('accounts')
  const entries = await ds.filter(injector, { select: ['name', 'ownerName', 'ownerType', 'current'] })
  return JsonResult(entries)
}
