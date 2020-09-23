import { tokens } from '@common/config'
import { dashboard } from '@common/models'
import { JsonResult, RequestAction } from '@furystack/rest'
import got from 'got'

const weatherForecastCache = new Map<string, dashboard.WeatherData>()

export const GetWeatherForecastAction: RequestAction<{
  query: { city: string; units: 'standard' | 'metric' | 'imperial' }
  result: dashboard.WeatherData
}> = async ({ getQuery }) => {
  const { city, units } = getQuery()

  const key = `${city}-${units}`

  if (weatherForecastCache.has(key)) {
    return JsonResult(weatherForecastCache.get(key) as dashboard.WeatherData)
  }
  const result = await got(
    `https://community-open-weather-map.p.rapidapi.com/forecast?q=${encodeURIComponent(
      city,
    )}&units=${encodeURIComponent(units)}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-host': tokens.rapidApiHost,
        'x-rapidapi-key': tokens.rapidApiKey,
        useQueryString: 'true',
      },
    },
  )
  const weatherData = JSON.parse(result.body)
  weatherForecastCache.set(key, weatherData)
  setTimeout(() => {
    // delete after 3 hours
    weatherForecastCache.delete(key)
  }, 1000 * 60 * 60 * 3)
  return JsonResult(weatherData)
}
