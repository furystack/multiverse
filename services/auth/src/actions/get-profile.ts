import { RequestError } from '@furystack/rest'
import { auth } from '@common/models'
import { JsonResult, RequestAction } from '@furystack/rest-service'
import { getDataSetFor } from '@furystack/repository'

export const GetProfile: RequestAction<{
  result: auth.Profile
  url: { username: string }
}> = async ({ injector, getUrlParams }) => {
  const profileStore = getDataSetFor(injector, auth.Profile, '_id')
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
