FROM node:18-alpine as base

# COPY --chown=node:node /services /home/node/app/services
# COPY --chown=node:node /workers /home/node/app/workers
COPY --chown=node:node /common /home/node/app/common

COPY --chown=node:node /package.json /home/node/app/package.json
COPY --chown=node:node /.yarn/plugins /home/node/app/.yarn/plugins
COPY --chown=node:node /.yarn/releases /home/node/app/.yarn/releases
COPY --chown=node:node /.yarn/sdks /home/node/app/.yarn/sdks
COPY --chown=node:node /.pnp.cjs /home/node/app/.pnp.cjs
COPY --chown=node:node /.pnp.loader.mjs /home/node/app/.pnp.loader.mjs
COPY --chown=node:node /yarn.lock /home/node/app/yarn.lock
COPY --chown=node:node /.yarnrc.yml /home/node/app/.yarnrc.yml

WORKDIR /home/node/app

USER node