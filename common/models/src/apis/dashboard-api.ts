import {
  RestApi,
  GetCollectionEndpoint,
  GetEntityEndpoint,
  PostEndpoint,
  PatchEndpoint,
  RequestAction,
} from '@furystack/rest'
import { Dashboard } from '../dashboard'
import { WeatherData } from '../dashboard/weather-data'

export interface DashboardApi extends RestApi {
  GET: {
    '/boards': GetCollectionEndpoint<Dashboard>
    '/boards/:id': GetEntityEndpoint<Dashboard>
    '/weather-forecast': RequestAction<{
      query: { city: string; units: 'standard' | 'metric' | 'imperial' }
      result: WeatherData
    }>
  }
  POST: {
    '/boards': PostEndpoint<Dashboard>
  }
  PATCH: {
    '/boards/:id': PatchEndpoint<Dashboard>
  }
}
