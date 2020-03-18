export const sites = {
  services: {
    'wrap-r': process.env.WRAPPR_SERVICE_URL || 'http://localhost:9090',
    'logg-r': process.env.LOGGR_SERVICE_URL || 'http://localhost:9091',
  },
  frontends: {
    'wrap-r': process.env.WRAPPR_FRONTEND_URL || 'http://localhost:8080',
  },
}
