FROM node:18-alpine

COPY --chown=node:node / /home/node/app

WORKDIR /home/node/app

RUN rm -rf frontends && yarn workspaces focus @service/auth --production

USER node
CMD ["yarn", "workspace", "@service/auth", "start"]