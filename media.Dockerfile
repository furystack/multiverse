FROM furystack/multiverse-base:latest

USER root

RUN apk add ffmpeg

USER node

EXPOSE 9093

CMD ["yarn", "workspace", "@service/media", "start"]