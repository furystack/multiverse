export type StringValues = { [K: string]: string }

export const updateFromEnvValues = <T extends StringValues>(obj: T, prefix = 'MULTIVERSE_') => {
  const keys = Object.keys(obj) as Array<keyof T>
  keys.map(key => {
    const fromEnv = process.env[`${prefix}${key}`]
    if (fromEnv) {
      obj[key] = fromEnv as T[keyof T]
    }
  })
  return obj
}

export const services = updateFromEnvValues(
  {
    wrapr: 'http://localhost:9090',
  },
  'MULTIVERSE_SERVICE_',
)

export const frontends = updateFromEnvValues(
  {
    default: 'http://localhost',
    wrapr: 'http://localhost:8080',
  },
  'MULTIVERSE_FRONTEND_',
)
