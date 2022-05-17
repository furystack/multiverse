FROM furystack/multiverse-base:latest as base

WORKDIR /home/node/app
COPY --chown=node:node /workers/media-encoder /home/node/app/workers/media-encoder

RUN yarn workspaces focus @worker/media-encoder --production

USER node
EXPOSE 9091
CMD ["yarn", "workspace", "@worker/media-encoder", "start"]