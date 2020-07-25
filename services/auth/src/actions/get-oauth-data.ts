import { JsonResult, RequestAction } from '@furystack/rest'
import { tokens } from '@common/config'

export const getOauthData: RequestAction<{
  result: {
    googleClientId: string
    githubClientId: string
  }
}> = async () =>
  JsonResult({
    githubClientId: tokens.githubClientId,
    googleClientId: tokens.googleClientId,
  })
