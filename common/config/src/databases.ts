export const databases = {
  'common-auth': {
    mongoUrl: process.env.MONGO_COMMON_AUTH_URL || process.env.MONGO_URL || 'mongodb://localhost:27017',
    dbName: 'multiverse-common-auth',
    usersCollection: 'users',
    sessionStoreUrl: process.env.SESSION_STORE_URL || process.env.MONGO_URL || 'mongodb://localhost:27017',
  },
  diag: {
    mongoUrl: process.env.MONGO_LOGGING_URL || process.env.MONGO_URL || 'mongodb://localhost:27017',
    dbName: 'multiverse-logs',
    logCollection: 'entries',
    patches: 'patches',
  },
  dashboard: {
    mongoUrl: process.env.MONGO_DASHBOARD_URL || process.env.MONGO_URL || 'mongodb://localhost:27017',
    dbName: 'multiverse-dashboard',
    dashboards: 'dashboards',
  },
  media: {
    mongoUrl: process.env.MONGO_MULTIVERSE_URL || process.env.MONGO_URL || 'mongodb://localhost:27017',
    dbName: 'multiverse-media',
    movieLibraries: 'movie-librariess',
    movieWatchEntries: 'movie-watch-entries',
    encodingTasks: 'encoding-tasks',
    movies: 'movies',
    series: 'series',
  },
}
