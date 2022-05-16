export * as apis from './apis'
export * as auth from './auth'
export * as diag from './diag'
export * as media from './media'
export * as dashboard from './dashboard'
export * as common from './common'
export * from './services'
export * from './owner'

import * as authSchema from './json-schemas-auth.json'
import * as dashboardSchema from './json-schemas-dashboard.json'
import * as diagSchema from './json-schemas-diag.json'
import * as mediaSchema from './json-schemas-media.json'
export { authSchema, dashboardSchema, diagSchema, mediaSchema }
