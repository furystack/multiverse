FROM furystack/multiverse-base:latest as base

WORKDIR /home/node/app
COPY --chown=node:node /services/media /home/node/app/services/media
RUN yarn workspaces focus @service/media --production

FROM node:18-alpine as runner

COPY --chown=node:node --from=base /home/node/app /home/node/app

WORKDIR /home/node/app
USER node
EXPOSE 9093

CMD ["yarn", "workspace", "@service/media", "start"]