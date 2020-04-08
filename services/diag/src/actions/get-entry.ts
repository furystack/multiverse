import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { LogEntry } from '@common/models'

export const GetEntry: RequestAction<{
  urlParams: { _id: string }
  result: LogEntry<any>
}> = async ({ injector, getUrlParams }) => {
  const ds = injector.getDataSetFor<LogEntry<any>>('logEntries')
  const { _id } = getUrlParams()
  const entry = await ds.get(injector, _id)
  if (!entry) {
    throw new RequestError('Log entry not found', 404)
  }
  return JsonResult(entry)
}
