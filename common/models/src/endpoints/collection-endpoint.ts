import { PartialResult, FindOptions } from '@furystack/core'
import { RequestAction } from '@furystack/rest'

export type CollectionEndpoint<T> = RequestAction<{
  query: { findOptions: FindOptions<T, Array<keyof T>> }
  result: { count: number; entries: Array<PartialResult<T, any>> }
}>
