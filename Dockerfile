FROM node:12

USER node

RUN npm set progress=false && npm config set depth 0

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
RUN npm install -g yarn

RUN mkdir /home/node/app
WORKDIR /home/node/app

ARG NPM_TOKEN

COPY --chown=node:node package*.json ./
RUN yarn install
    

COPY --chown=node:node . .

# create different user for running the application and preventing write access for source files
USER root
RUN groupadd --gid 2000 app \
  && useradd --uid 2000 --gid app --shell /bin/bash --create-home app
USER app

EXPOSE 8080
EXPOSE 9090
USER node
CMD [ "yarn", "start" ]
