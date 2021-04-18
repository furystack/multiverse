import { RequestError } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { auth } from '@common/models'
import { HttpUserContext, JsonResult, RequestAction } from '@furystack/rest-service'
import { downloadAsTempFile, saveAvatar } from '@common/service-utils'
import { GithubAuthService } from '../services/github-login-service'

export const GithubRegisterAction: RequestAction<{
  body: { code: string; clientId: string }
  result: Omit<auth.User, 'password'>
}> = async ({ injector, getBody, response }) => {
  const { code, clientId } = await getBody()

  const logger = injector.logger.withScope('GithubRegisterAction')

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
    password: '',
    roles: ['terms-accepted'],
    username: githubApiPayload.email || `${githubApiPayload.login}@github.com`,
    registrationDate,
  })

  const newUser = created[0]

  await storeManager.getStoreFor(auth.GithubAccount, '_id').add({
    accountLinkDate: registrationDate,
    username: newUser.username,
    githubId: githubApiPayload.id,
    githubApiPayload,
  })

  await storeManager.getStoreFor(auth.Profile, '_id').add({
    username: newUser.username,
    displayName: newUser.username,
    description: '',
    userSettings: {
      theme: 'dark',
    },
  })

  await injector.getInstance(HttpUserContext).cookieLogin(newUser, response)
  const { password, ...user } = newUser
  await logger.information({
    message: `User ${newUser.username} has been registered with Github Auth.`,
    data: newUser,
  })

  try {
    const tempFilePath =
      githubApiPayload && githubApiPayload.avatar_url && (await downloadAsTempFile(githubApiPayload.avatar_url))
    tempFilePath && (await saveAvatar({ injector, user: newUser, tempFilePath }))
  } catch (error) {
    await logger.warning({ message: 'Failed to get Avatar', data: { message: error.message, stack: error.stack } })
  }

  return JsonResult({ ...user })
}
