export const sites = {
  services: {
    auth: {
      internalPort: process.env.AUTH_SERVICE_INTERNAL_PORT || 9090,
      externalPath: process.env.AUTH_SERVICE_EXTERNAL_URL || 'http://localhost:9090',
    },
    'logg-r': {
      internalPort: process.env.LOGGR_SERVICE_INTERNAL_PORT || 9091,
      externalPath: process.env.LOGGR_SERVICE_EXTERNAL_URL || 'http://localhost:9091',
    },
    xpense: {
      internalPort: process.env.XPENSE_SERVICE_INTERNAL_PORT || 9092,
      externalPath: process.env.XPENSE_SERVICE_EXTERNAL_URL || 'http://localhost:9092',
    },
  },
  frontends: {
    core: process.env.CORE_FRONTEND_URL || 'http://localhost:8080',
  },
}
