import { RequestAction, JsonResult } from '@furystack/rest'
import { UserSettings, auth } from '@common/models'
import { deepMerge } from '@furystack/utils'

export const PostSettings: RequestAction<{
  body: UserSettings
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
