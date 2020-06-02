import { RequestAction, RequestError, BypassResult } from '@furystack/rest'
import { auth } from '@common/models'
import got from 'got'

export const GetAvatar: RequestAction<{
  result: string
  urlParams: { username: string }
}> = async ({ injector, getUrlParams, response }) => {
  const profileStore = injector.getDataSetFor(auth.Profile)
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
  const imgResult = got(profile.avatarUrl)
  const buffer = await imgResult.buffer()
  response.end(buffer, 'binary')
  return BypassResult()
}
