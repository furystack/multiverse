import { RequestError } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { PasswordCredential, PasswordAuthenticator, SecurityPolicyManager } from '@furystack/security'
import { auth } from '@common/models'
import { HttpUserContext, JsonResult, RequestAction } from '@furystack/rest-service'

export const RegisterAction: RequestAction<{
  body: { email: string; password: string }
  result: Omit<auth.User, 'password'>
}> = async ({ injector, getBody, response }) => {
  const logger = injector.getLogger().withScope('RegisterAction')
  const storeManager = injector.getInstance(StoreManager)
  const { email, password } = await getBody()
  const userStore = storeManager.getStoreFor(auth.User, '_id')
  const existing = await userStore.find({ filter: { username: { $eq: email } } })
  if (existing && existing.length) {
    await logger.information({
      message: 'Tried to register an already existing user',
      data: { email, user: existing[0] },
    })
    throw new RequestError('Failed to register user', 400)
  }
  const userCtx = injector.getInstance(HttpUserContext)

  const passwordCheckResult = await injector.getInstance(SecurityPolicyManager).matchPasswordComplexityRules(password)
  if (!passwordCheckResult.match) {
    throw new RequestError(
      `Password does not match complexity rules: ${passwordCheckResult.errors
        .map((e) => e.message.toString())
        .join(', ')}`,
      400,
    )
  }

  const pw = await injector.getInstance(PasswordAuthenticator).getHasher().createCredential(email, password)

  const { created } = await userStore.add({
    username: email,
    // password: userCtx.authentication.hashMethod(password),
    roles: [],
    registrationDate: new Date().toISOString(),
  })

  await storeManager.getStoreFor(PasswordCredential, 'userName').add(pw)

  const user = created[0]
  await storeManager.getStoreFor(auth.Profile, '_id').add({
    username: user.username,
    displayName: user.username,
    description: '',
    userSettings: { theme: 'dark' },
  })
  await userCtx.cookieLogin(user, response)

  await logger.information({
    message: `A New user has been registered with the username '${user.username}'`,
    data: { ...user },
  })
  return JsonResult(user, 200)
}
