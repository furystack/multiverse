import { RequestError } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { auth } from '@common/models'
import { HttpUserContext, JsonResult, RequestAction } from '@furystack/rest-service'
import { downloadAsTempFile, saveAvatar } from '@common/service-utils'
import { getLogger } from '@furystack/logging'
import { GithubAuthService } from '../services/github-login-service'

export const GithubRegisterAction: RequestAction<{
  body: { code: string; clientId: string }
  result: Omit<auth.User, 'password'>
}> = async ({ injector, getBody, response }) => {
  const { code, clientId } = await getBody()

  const logger = getLogger(injector).withScope('GithubRegisterAction')

  const storeManager = injector.getInstance(StoreManager)

  const registrationDate = new Date().toISOString()
  const githubApiPayload = await injector.getInstance(GithubAuthService).getGithubUserData({ code, clientId })

  const existingGhUsers = await storeManager
    .getStoreFor(auth.GithubAccount, '_id')
    .find({ filter: { githubId: { $eq: githubApiPayload.id } }, top: 2 })
  if (existingGhUsers.length !== 0) {
    throw new RequestError(`Github user already registered`, 401)
  }

  const { created } = await storeManager.getStoreFor(auth.User, '_id').add({
    roles: ['terms-accepted'],
    username: githubApiPayload.email || `${githubApiPayload.login}@github.com`,
    registrationDate,
  })

  const user = created[0]

  await storeManager.getStoreFor(auth.GithubAccount, '_id').add({
    accountLinkDate: registrationDate,
    username: user.username,
    githubId: githubApiPayload.id,
    githubApiPayload,
  })

  await storeManager.getStoreFor(auth.Profile, '_id').add({
    username: user.username,
    displayName: user.username,
    description: '',
    userSettings: {
      theme: 'dark',
    },
  })

  await injector.getInstance(HttpUserContext).cookieLogin(user, response)
  await logger.information({
    message: `User ${user.username} has been registered with Github Auth.`,
    data: user,
  })

  try {
    const tempFilePath =
      githubApiPayload && githubApiPayload.avatar_url && (await downloadAsTempFile(githubApiPayload.avatar_url))
    tempFilePath && (await saveAvatar({ injector, user, tempFilePath }))
  } catch (error) {
    await logger.warning({ message: 'Failed to get Avatar', data: { error } })
  }

  return JsonResult({ ...user })
}
