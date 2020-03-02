export type StringValues = { [K: string]: string }

const allEnvVariables: any = {}

export const updateFromEnvValues = <T extends StringValues>(obj: T, prefix = 'MULTIVERSE_') => {
  const keys = Object.keys(obj) as Array<keyof T>
  keys.map(key => {
    const fromEnv = process.env[`${prefix}${key}`]
    if (fromEnv) {
      obj[key] = fromEnv as T[keyof T]
      allEnvVariables[`${prefix}${key}`] = fromEnv
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

export const databases = updateFromEnvValues(
  {
    commonAuth: 'mongodb://localhost:27017',
    logs: 'mongodb://localhost:27017',
  },
  'MULTIVERSE_DATABASE_',
)

export const sessionStore = updateFromEnvValues(
  {
    host: 'localhost',
    port: '63790',
  },
  'MULTIVERSE_SESSIONSTORE_',
)

export const tokens = updateFromEnvValues(
  {
    googleClientId: 'notProvided',
    githubClientId: 'notProvided',
    githubClientSecret: 'notProvided',
  },
  'MULTIVERSE_TOKEN_',
)

export const getAllEnvVariables = () => {
  return { ...allEnvVariables }
}
