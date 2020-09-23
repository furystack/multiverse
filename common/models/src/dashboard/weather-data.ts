export interface WeatherDataCity {
  id: string
  name: string
  coord: {
    lat: number
    lon: number
  }
  country: string
  population: number
  timezone: number
  sunrise: number
  sunset: number
}

export interface WeatherDataListEntry {
  main: {
    temp: number
    temp_min: number
    temp_max: number
    pressure: number
    sea_level: number
    grnd_level: number
    humidity: number
    temp_kf: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  clouds: Array<{ type: number }> // ???
  wind: {
    speed: number
    deg: number
  }
  sys: {
    pod: string // ???
  }
  dt_txt: string
}

export interface WeatherData {
  cod: string
  message: number
  cnt: number
  city: WeatherDataCity
  list: WeatherDataListEntry[]
}
