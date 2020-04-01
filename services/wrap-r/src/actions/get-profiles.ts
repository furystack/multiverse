import { RequestAction, JsonResult } from '@furystack/rest'
import { Profile } from 'common-models'
import { PartialResult } from '@furystack/core'

export const GetProfiles: RequestAction<{
  query: { search?: string }
  result: Array<PartialResult<Profile, any>>
}> = async ({ injector, getQuery }) => {
  const profileStore = injector.getDataSetFor(Profile)
  const { search } = getQuery()
  const result = await profileStore.filter(injector, {
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
