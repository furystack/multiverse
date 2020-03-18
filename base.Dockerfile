FROM node:12-alpine AS build
USER node

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node / ./
RUN yarn install
RUN yarn build:services

RUN yarn install --production=true

FROM node:12-alpine AS slim
COPY --from=build /home/node/app /home/node/app
WORKDIR /home/node/app
