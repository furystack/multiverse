FROM furystack/multiverse-base:latest

EXPOSE 9090

CMD ["yarn", "workspace", "@service/xpense", "start"]