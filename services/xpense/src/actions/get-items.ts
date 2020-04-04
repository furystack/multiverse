import { RequestAction, JsonResult } from '@furystack/rest'
import { xpense } from 'common-models'

export const GetItems: RequestAction<{
  result: xpense.Item[]
}> = async ({ injector }) => {
  const ds = injector.getDataSetFor<xpense.Item>('items')
  const entries = await ds.filter(injector, {})
  return JsonResult(entries)
}
