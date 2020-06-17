import { RequestAction } from '@furystack/rest'

export type SinglePatchEndpoint<T> = RequestAction<{
  body: T
  urlParams: { id: T[keyof T] }
  result: { success: boolean }
}>
