export const sites = {
  services: {
    'wrap-r': {
      internalPort: process.env.WRAPPR_SERVICE_INTERNAL_PORT || 9090,
      externalPath: process.env.WRAPPR_SERVICE_EXTENRAL_URL || 'http://localhost:9090/api',
    },
    'logg-r': {
      internalPort: process.env.LOGGR_SERVICE_INTERNAL_PORT || 9091,
      externalPath: process.env.LOGGR_SERVICE_EXTENAL_URL || 'http://localhost:9091/api',
    },
  },
  frontends: {
    'wrap-r': process.env.WRAPPR_FRONTEND_URL || 'http://localhost:8080',
  },
}
