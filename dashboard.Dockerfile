FROM node:18-alpine

COPY --chown=node:node / /home/node/app

WORKDIR /home/node/app

RUN yarn workspaces focus @service/dashboard --production

USER node
CMD ["yarn", "workspace", "@service/dashboard", "start"]