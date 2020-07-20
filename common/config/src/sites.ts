export const sites = {
  services: {
    auth: {
      internalPort: process.env.AUTH_SERVICE_INTERNAL_PORT || 9090,
      apiPath: '/api/auth',
    },
    diag: {
      internalPort: process.env.DIAG_SERVICE_INTERNAL_PORT || 9091,
      apiPath: '/api/diag',
    },
    xpense: {
      internalPort: process.env.XPENSE_SERVICE_INTERNAL_PORT || 9092,
      apiPath: '/api/xpense',
    },
    media: {
      internalPort: process.env.MEDIA_SERVICE_INTERNAL_PORT || 9093,
      apiPath: '/api/media',
    },
    dashboard: {
      internalPort: process.env.DASHBOARD_SERVICE_INTERNAL_PORT || 9094,
      apiPath: '/api/dashboard',
    },
  },
  frontends: {
    core: process.env.CORE_FRONTEND_URL || 'http://localhost:8080',
  },
}
