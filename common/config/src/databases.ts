export const databases = {
  'common-auth': {
    mongoUrl: 'mongodb://localhost:27017',
    dbName: 'multiverse-common-auth',
    usersCollection: 'users',
    sessionStore: {
      host: 'localhost',
      port: '63790',
    },
  },
  logging: {
    mongoUrl: 'mongodb://localhost:27017',
    dbName: 'multiverse-logs',
    logCollection: 'entries',
  },
}
