FROM furystack/multiverse-base:latest

EXPOSE 9093

CMD ["yarn", "workspace", "@service/media", "start"]