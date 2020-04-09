import { RequestAction, RequestError, BypassResult } from '@furystack/rest'
import { Profile } from '@common/models'
import got from 'got'

export const GetAvatar: RequestAction<{
  result: string
  urlParams: { username: string }
}> = async ({ injector, getUrlParams }) => {
  const profileStore = injector.getDataSetFor<Profile>('profiles')
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
  const imgResult = got(profile.avatarUrl)
  const buffer = await imgResult.buffer()
  injector.getResponse().end(buffer, 'binary')
  return BypassResult()
}
