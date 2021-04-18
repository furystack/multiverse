import { ResponseError } from '@furystack/rest-client-fetch/dist/response-error'

export const getErrorMessage = async (error: Error): Promise<string> => {
  if (error instanceof ResponseError) {
    try {
      const responseBody = await error.response.json()
      return responseBody.message?.toString() || error.toString()
    } catch {
      // failed to deserialize, fall back to error.toString()
    }
  }
  return error.toString()
}
