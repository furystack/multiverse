import { RestApi } from '@furystack/rest'
import { CollectionEndpoint, SingleEntityEndpoint, SinglePostEndpoint, SinglePatchEndpoint } from '../endpoints'
import { Dashboard } from '../dashboard'

export interface DashboardApi extends RestApi {
  GET: {
    '/boards': CollectionEndpoint<Dashboard>
    '/boards/:id': SingleEntityEndpoint<Dashboard>
  }
  POST: {
    '/boards': SinglePostEndpoint<Dashboard>
  }
  PATCH: {
    '/boards/:id': SinglePatchEndpoint<Dashboard>
  }
}
