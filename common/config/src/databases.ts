export const databases = {
  'common-auth': {
    mongoUrl: process.env.MONGO_COMMON_AUTH_URL || process.env.MONGO_URL || 'mongodb://localhost:27017',
    dbName: 'multiverse-common-auth',
    usersCollection: 'users',
    sessionStoreUrl: process.env.SESSION_STORE_URL || process.env.MONGO_URL || 'mongodb://localhost:27017',
  },
  logging: {
    mongoUrl: process.env.MONGO_LOGGING_URL || process.env.MONGO_URL || 'mongodb://localhost:27017',
    dbName: 'multiverse-logs',
    logCollection: 'entries',
  },
  xpense: {
    mongoUrl: process.env.MONGO_XPENSE_URL || process.env.MONGO_URL || 'mongodb://localhost:27017',
    dbName: 'multiverse-xpense',
    accounts: 'accounts',
    items: 'items',
    replenishments: 'replenishments',
    shops: 'shops',
    shoppings: 'private-xpenses',
  },
  media: {
    mongoUrl: process.env.MONGO_MULTIVERSE_URL || process.env.MONGO_URL || 'mongodb://localhost:27017',
    dbName: 'multiverse-media',
    movieLibraries: 'movie-librariess',
    movieWatchEntries: 'movie-watch-entries',
    movies: 'movies',
  },
  standardOptions: {
    useUnifiedTopology: true,
  },
}
