import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { Profile } from '@common/models'
import { PartialResult } from '@furystack/core'

export const GetProfile: RequestAction<{
  result: PartialResult<Profile, any>
  urlParams: { username: string }
}> = async ({ injector, getUrlParams }) => {
  const profileStore = injector.getDataSetFor<Profile>('profiles')
  const { username } = getUrlParams()
  const result = await profileStore.find(injector, {
    filter: {
      username: { $eq: username },
    },
    top: 1,
  })
  const profile = result[0]
  if (!profile) {
    throw new RequestError(`The profile for user '${username}' does not exists`, 404)
  }
  return JsonResult(profile)
}
