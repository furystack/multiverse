FROM furystack/multiverse-base:latest as base

WORKDIR /home/node/app
COPY --chown=node:node /services/diag /home/node/app/services/diag
RUN yarn workspaces focus @service/diag --production

FROM node:18-alpine as runner

COPY --chown=node:node --from=base /home/node/app /home/node/app

WORKDIR /home/node/app

EXPOSE 9091

CMD ["yarn", "workspace", "@service/diag", "start"]