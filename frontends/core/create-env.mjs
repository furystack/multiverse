import { join } from 'path'
import { writeFile } from 'fs/promises'

const exec = async () => {
  const targetPath = '/var/www/multiverse.my.to/public/static/env.js'

  const __multiverse_site_roots = {
    ...(process.env.API_ROOT_AUTH ? { auth: process.env.API_ROOT_AUTH } : {}),
    ...(process.env.API_ROOT_DASHBOARD ? { dashboard: process.env.API_ROOT_DASHBOARD } : {}),
    ...(process.env.API_ROOT_DIAG ? { diag: process.env.API_ROOT_DIAG } : {}),
    ...(process.env.API_ROOT_MEDIA ? { media: process.env.API_ROOT_MEDIA } : {}),
  }

  const __multiverse_api_root = process.env.API_ROOT

  await writeFile(
    targetPath,
    `${__multiverse_api_root ? `window.__multiverse_api_root = ${JSON.stringify(__multiverse_api_root)}` : ''}
${
  Object.keys(__multiverse_site_roots).length
    ? `window.__multiverse_site_roots = ${JSON.stringify(__multiverse_site_roots, undefined, 2)}`
    : ''
}
globalThis.process = { env: {} };
`,
  )
}

exec().catch((error) => console.error(error))
