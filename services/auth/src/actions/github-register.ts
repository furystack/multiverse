/* eslint-disable @typescript-eslint/camelcase */
import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { User, GithubAccount, Profile } from '@common/models'
import { HttpUserContext } from '@furystack/rest-service'
import { GithubAuthService } from '../services/github-login-service'

export const GithubRegisterAction: RequestAction<{ body: { code: string; clientId: string }; result: User }> = async ({
  injector,
  getBody,
  response,
}) => {
  const { code, clientId } = await getBody()

  const logger = injector.logger.withScope('GithubRegisterAction')

  const storeManager = injector.getInstance(StoreManager)

  const registrationDate = new Date().toISOString()
  const githubApiPayload = await injector.getInstance(GithubAuthService).getGithubUserData({ code, clientId })

  const existingGhUsers = await storeManager
    .getStoreFor(GithubAccount)
    .find({ filter: { githubId: { $eq: githubApiPayload.id } }, top: 2 })
  if (existingGhUsers.length !== 0) {
    throw new RequestError(`Github user already registered`, 401)
  }

  const newUser = {
    password: '',
    roles: ['terms-accepted'],
    username: githubApiPayload.email || `${githubApiPayload.login}@github.com`,
    registrationDate,
  } as User
  await storeManager.getStoreFor(User).add(newUser)

  await storeManager.getStoreFor(GithubAccount).add({
    accountLinkDate: registrationDate,
    username: newUser.username,
    githubId: githubApiPayload.id,
    githubApiPayload,
  } as GithubAccount)

  await storeManager.getStoreFor(Profile).add({
    username: newUser.username,
    displayName: newUser.username,
    avatarUrl: githubApiPayload.avatar_url || undefined,
  } as Profile)

  await injector.getInstance(HttpUserContext).cookieLogin(newUser, response)
  delete newUser.password
  logger.information({
    message: `User ${newUser.username} has been registered with Github Auth.`,
    data: newUser,
  })
  return JsonResult({ ...newUser })
}
