import { RestApi, GetCollectionEndpoint, GetEntityEndpoint, PostEndpoint, PatchEndpoint } from '@furystack/rest'
import { Dashboard } from '../dashboard'

export interface DashboardApi extends RestApi {
  GET: {
    '/boards': GetCollectionEndpoint<Dashboard>
    '/boards/:id': GetEntityEndpoint<Dashboard>
  }
  POST: {
    '/boards': PostEndpoint<Dashboard>
  }
  PATCH: {
    '/boards/:id': PatchEndpoint<Dashboard>
  }
}
