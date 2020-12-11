FROM node:14-alpine AS slim

COPY --chown=node:node / /home/node/app

WORKDIR /home/node/app

RUN yarn install --production --ignore-optional

USER node

