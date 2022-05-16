FROM furystack/multiverse-base:latest as base

WORKDIR /home/node/app
COPY --chown=node:node /services/dashboard /home/node/app/services/dashboard
RUN yarn workspaces focus @service/dashboard --production

FROM node:18-alpine as runner

COPY --chown=node:node --from=base /home/node/app /home/node/app

WORKDIR /home/node/app
USER node
EXPOSE 9094

CMD ["yarn", "workspace", "@service/dashboard", "start"]