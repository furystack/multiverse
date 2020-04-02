import { RequestAction, JsonResult } from '@furystack/rest'
import { Organization } from 'common-models'
import { PartialResult } from '@furystack/core'

export const GetOrganizations: RequestAction<{
  query: { search?: string; top?: number; skip?: number }
  result: Array<PartialResult<Organization, any>>
}> = async ({ injector, getQuery }) => {
  const profileStore = injector.getDataSetFor(Organization)
  const { search, top, skip } = getQuery()
  const result = await profileStore.filter(injector, {
    top,
    skip,
    filter: {
      $or: [
        {
          name: {
            $regex: search || '.',
          },
        },
        {
          description: {
            $regex: search || '.',
          },
        },
      ],
    },
  })
  return JsonResult(result)
}
