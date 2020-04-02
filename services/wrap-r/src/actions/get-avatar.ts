import { RequestAction, RequestError, BypassResult } from '@furystack/rest'
import { Profile } from 'common-models'

export const GetAvatar: RequestAction<{
  result: string
  urlParams: { username: string }
}> = async ({ injector, getUrlParams }) => {
  const profileStore = injector.getDataSetFor(Profile)
  const { username } = getUrlParams()
  const result = await profileStore.filter(injector, {
    filter: {
      username,
    },
    top: 1,
  })
  const profile = result[0]
  if (!profile) {
    throw new RequestError(`The profile for user '${username}' does not exists`, 404)
  }
  injector.getResponse().end(profile.avatar)
  return BypassResult()
}
