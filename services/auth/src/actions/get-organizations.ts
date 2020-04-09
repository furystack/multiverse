import { RequestAction, JsonResult } from '@furystack/rest'
import { Organization } from '@common/models'
import { PartialResult, SearchOptions } from '@furystack/core'

export const GetOrganizations: RequestAction<{
  query: { filter: SearchOptions<Organization, any> }
  result: { entries: Array<PartialResult<Organization, any>>; count: number }
}> = async ({ injector, getQuery }) => {
  const orgStore = injector.getDataSetFor<Organization>('organizations')
  const { filter } = getQuery()
  const entries = await orgStore.filter(injector, filter)
  const count = await orgStore.count(injector, filter.filter)
  return JsonResult({ entries, count })
}
