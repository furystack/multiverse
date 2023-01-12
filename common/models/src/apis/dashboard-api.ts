import type { RestApi, GetCollectionEndpoint, GetEntityEndpoint, PostEndpoint, PatchEndpoint } from '@furystack/rest'
import type { Dashboard } from '../dashboard'
import type { WeatherData } from '../dashboard/weather-data'

export interface DashboardApi extends RestApi {
  GET: {
    '/boards': GetCollectionEndpoint<Dashboard>
    '/boards/:id': GetEntityEndpoint<Dashboard, '_id'>
    '/weather-forecast': {
      query: { city: string; units: 'standard' | 'metric' | 'imperial' }
      result: WeatherData
    }
  }
  POST: {
    '/boards': PostEndpoint<Pick<Dashboard, 'name' | 'description' | '_id'>, '_id'>
  }
  PATCH: {
    '/boards/:id': PatchEndpoint<Dashboard, '_id'>
  }
}
