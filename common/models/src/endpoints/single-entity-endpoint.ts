import { PartialResult, FindOptions } from '@furystack/core'
import { RequestAction } from '@furystack/rest'

export type SingleEntityEndpoint<T> = RequestAction<{
  urlParams: { id: T[keyof T] }
  query: { select: FindOptions<T, Array<keyof T>>['select'] }
  result: PartialResult<T, any>
}>
