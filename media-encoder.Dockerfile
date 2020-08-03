FROM furystack/multiverse-base:latest

RUN apk add ffmpeg

EXPOSE 9093

CMD ["yarn", "workspace", "@workers/media-encoder", "start"]