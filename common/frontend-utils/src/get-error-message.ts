import { ResponseError } from '@furystack/rest-client-fetch/dist/response-error'

export const getErrorMessage = async (error: Error): Promise<string> => {
  if (error instanceof ResponseError) {
    const responseBody = await error.response.json()
    return responseBody.message?.toString() || error.toString()
  } else {
    return error.toString()
  }
}
