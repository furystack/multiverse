FROM furystack/multiverse-base:latest

EXPOSE 9091

CMD ["yarn", "workspace @service/diag start"]