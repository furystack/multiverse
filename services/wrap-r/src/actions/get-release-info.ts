import { join } from 'path'
import { RequestAction, JsonResult } from '@furystack/rest'

export const GetReleaseInfoAction: RequestAction<{ result: {} }> = async () => {
  try {
    const responseBody = await import(join(process.cwd(), 'releaseinfo.json'))
    return JsonResult(responseBody)
  } catch (error) {
    return JsonResult(
      {
        message: 'There was an error while reading the release info',
        error: {
          message: error.message,
        },
      },
      500,
    )
  }
}
