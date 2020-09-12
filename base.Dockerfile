FROM node:14-alpine AS build
USER node

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node / ./
RUN yarn install --ignore-optional
RUN yarn recreate-schemas
RUN yarn build:services
RUN yarn build:workers

RUN yarn install --production=true --ignore-optional

FROM node:14-alpine AS slim
COPY --from=build /home/node/app /home/node/app
WORKDIR /home/node/app
