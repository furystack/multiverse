FROM furystack/multiverse-base:latest as base

FROM node:18-alpine AS slim

USER root

RUN apk add ffmpeg

USER node

COPY --from=base --chown=node:node /home/node/app/node_modules /home/node/app/node_modules
COPY --from=base --chown=node:node /home/node/app/common /home/node/app/common
COPY --from=base --chown=node:node /home/node/app/package.json /home/node/app/package.json
COPY --from=base --chown=node:node /home/node/app/services/media /home/node/app/services/media

WORKDIR /home/node/app

EXPOSE 9093

CMD ["yarn", "workspace", "@service/media", "start"]