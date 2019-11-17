FROM node:12

USER node

RUN npm set progress=false && npm config set depth 0

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node . .

RUN npm install -g yarn

RUN yarn workspace wrap-r-service install
RUN yarn workspace wrap-r-service build

EXPOSE 9090
CMD [ "yarn","workspace","wrap-r-service","start" ]
