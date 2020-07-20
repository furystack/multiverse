FROM node:14-alpine AS build
USER node

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node / ./
RUN yarn install
RUN yarn recreate-schemas
RUN yarn build:services

RUN yarn install --production=true --ignore-optional

FROM node:12-alpine AS slim
COPY --from=build /home/node/app /home/node/app
WORKDIR /home/node/app
