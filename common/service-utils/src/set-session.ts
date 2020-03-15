import { RequestAction, JsonResult } from '@furystack/rest'
import { HttpAuthenticationSettings } from '@furystack/rest-service'

export const SetSessionAction: RequestAction<{ query: { session: string } }> = async ({ injector, getQuery }) => {
  const response = await injector.getResponse()
  const { session } = getQuery()
  const authSettings = injector.getInstance(HttpAuthenticationSettings)
  response.setHeader('Set-Cookie', `${authSettings.cookieName}=${session}; Path=/; HttpOnly`)

  return JsonResult({})
}
