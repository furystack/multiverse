import { RequestAction, JsonResult } from '@furystack/rest-service'
import { auth } from '@common/models'
import { deepMerge } from '@furystack/utils'

export const PostSettings: RequestAction<{
  body: auth.UserSettings
  result: auth.UserSettings
}> = async ({ injector, getBody }) => {
  const user = await injector.getCurrentUser()
  const profiles = injector.getDataSetFor(auth.Profile)
  const postedSettings = await getBody()
  const [profile] = await profiles.find(injector, {
    top: 1,
    filter: { username: { $eq: user.username } },
  })
  const newUserSettings = deepMerge({ ...profile.userSettings }, postedSettings)
  await profiles.update(injector, profile._id, { userSettings: newUserSettings })
  return JsonResult(newUserSettings)
}
