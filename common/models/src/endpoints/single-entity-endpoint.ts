import { PartialResult, FindOptions } from '@furystack/core'
import { RequestAction } from '@furystack/rest'

export type SingleEntityEndpoint<T> = RequestAction<{
  query: { select: FindOptions<T, Array<keyof T>>['select'] }
  urlParams: { id: T[keyof T] }
  result: PartialResult<T, any>
}>
