import { RestApi, RequestAction } from '@furystack/rest'

export interface SessionApi extends RestApi {
  GET: {
    '/setSession': RequestAction<{ query: { session: string } }>
  }
}
