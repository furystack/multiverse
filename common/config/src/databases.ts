export const databases = {
  'common-auth': {
    mongoUrl: process.env.MONGO_COMMON_AUTH_URL || process.env.MONGO_URL || 'mongodb://localhost:27017',
    dbName: 'multiverse-common-auth',
    usersCollection: 'users',
    sessionStore: {
      host: process.env.SESSION_STORE_HOST || process.env.REDIS_HOST || 'localhost',
      port: process.env.SESSION_STORE_PORT || process.env.REDIS_PORT || '63790',
    },
  },
  logging: {
    mongoUrl: process.env.MONGO_LOGGING_URL || process.env.MONGO_URL || 'mongodb://localhost:27017',
    dbName: 'multiverse-logs',
    logCollection: 'entries',
  },
}
