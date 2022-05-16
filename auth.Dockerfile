FROM furystack/multiverse-base:latest as base

WORKDIR /home/node/app
COPY --chown=node:node /services/auth /home/node/app/services/auth
RUN yarn workspaces focus @service/auth --production

FROM node:18-alpine as runner

COPY --chown=node:node --from=base /home/node/app /home/node/app

WORKDIR /home/node/app
EXPOSE 9090
USER node

CMD ["yarn", "workspace", "@service/auth", "start"]