import type { RequestAction } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest-service'
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
