FROM furystack/multiverse-base:latest

EXPOSE 9094

CMD ["yarn", "workspace", "@service/dashboard", "start"]