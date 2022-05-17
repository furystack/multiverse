import { RequestAction, JsonResult } from '@furystack/rest-service'
import { auth } from '@common/models'
import { deepMerge } from '@furystack/utils'
import { getCurrentUser } from '@furystack/core'
import { getDataSetFor } from '@furystack/repository'

export const PostSettings: RequestAction<{
  body: auth.UserSettings
  result: auth.UserSettings
}> = async ({ injector, getBody }) => {
  const user = await getCurrentUser(injector)
  const profiles = getDataSetFor(injector, auth.Profile, '_id')
  const postedSettings = await getBody()
  const [profile] = await profiles.find(injector, {
    top: 1,
    filter: { username: { $eq: user.username } },
  })
  const newUserSettings = deepMerge({ ...profile.userSettings }, postedSettings)
  await profiles.update(injector, profile._id, { userSettings: newUserSettings })
  return JsonResult(newUserSettings)
}
