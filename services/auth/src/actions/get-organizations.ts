import { RequestAction, JsonResult } from '@furystack/rest'
import { Organization } from '@common/models'
import { PartialResult, FindOptions } from '@furystack/core'

export const GetOrganizations: RequestAction<{
  query: { filter: FindOptions<Organization, any> }
  result: { entries: Array<PartialResult<Organization, any>>; count: number }
}> = async ({ injector, getQuery }) => {
  const orgStore = injector.getDataSetFor<Organization>('organizations')
  const { filter } = getQuery()
  const entries = await orgStore.find(injector, filter)
  const count = await orgStore.count(injector, filter.filter)
  return JsonResult({ entries, count })
}
