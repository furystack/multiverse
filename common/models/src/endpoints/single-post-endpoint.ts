import { WithOptionalId } from '@furystack/core'
import { RequestAction } from '@furystack/rest'

export type SinglePostEndpoint<T> = RequestAction<{
  body: WithOptionalId<T, keyof T>
  result: T
}>
