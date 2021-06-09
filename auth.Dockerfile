FROM furystack/multiverse-base:latest as base

FROM node:14-alpine AS slim

COPY --from=base --chown=node:node /home/node/app/node_modules /home/node/app/node_modules
COPY --from=base --chown=node:node /home/node/app/common /home/node/app/common
COPY --from=base --chown=node:node /home/node/app/package.json /home/node/app/package.json
COPY --from=base --chown=node:node /home/node/app/services/auth /home/node/app/services/auth

WORKDIR /home/node/app

EXPOSE 9090

CMD ["yarn", "workspace", "@service/auth", "start"]