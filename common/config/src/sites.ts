export const sites = {
  services: {
    auth: {
      internalPort: process.env.AUTH_SERVICE_INTERNAL_PORT || 9090,
      externalPath: process.env.AUTH_SERVICE_EXTERNAL_URL || 'http://localhost:9090/api',
    },
    diag: {
      internalPort: process.env.DIAG_SERVICE_INTERNAL_PORT || 9091,
      externalPath: process.env.DIAG_SERVICE_EXTERNAL_URL || 'http://localhost:9091/api',
    },
    xpense: {
      internalPort: process.env.XPENSE_SERVICE_INTERNAL_PORT || 9092,
      externalPath: process.env.XPENSE_SERVICE_EXTERNAL_URL || 'http://localhost:9092/api',
    },
    media: {
      internalPort: process.env.MEDIA_SERVICE_INTERNAL_PORT || 9093,
      externalPath: process.env.MEDIA_SERVICE_EXTERNAL_URL || 'http://localhost:9093/api',
    },
  },
  frontends: {
    core: process.env.CORE_FRONTEND_URL || 'http://localhost:8080',
  },
}
