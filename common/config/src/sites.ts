export const sites = {
  services: {
    'wrap-r': process.env.WRAPPR_SERVICE_URL || 'http://0.0.0.0:9090',
    'logg-r': process.env.LOGGR_SERVICE_URL || 'http://0.0.0.0:9091',
  },
  frontends: {
    'wrap-r': process.env.WRAPPR_FRONTEND_URL || 'http://0.0.0.0:8080',
  },
}
