import { RequestAction, JsonResult } from '@furystack/rest'
import { Profile } from '@common/models'
import { PartialResult } from '@furystack/core'

export const GetProfiles: RequestAction<{
  query: { search?: string; top?: number; skip?: number }
  result: Array<PartialResult<Profile, any>>
}> = async ({ injector, getQuery }) => {
  const profileStore = injector.getDataSetFor<Profile>('profiles')
  const { search, top, skip } = getQuery()
  const result = await profileStore.find(injector, {
    top,
    skip,
    filter: {
      $or: [
        {
          displayName: {
            $regex: search || '.',
          },
        },
        {
          username: {
            $regex: search || '.',
          },
        },
      ],
    },
  })
  return JsonResult(result)
}
