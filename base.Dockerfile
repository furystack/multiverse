FROM node:18-alpine AS slim

COPY --chown=node:node / /home/node/app

WORKDIR /home/node/app

RUN rm -rf frontends && yarn install    --production \ 
                    --ignore-optional \
                    --network-timeout 100000 \
                    --ignore-scripts \
                    --frozen-lockfile

RUN yarn cache clean

USER node
