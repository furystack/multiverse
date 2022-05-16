
# FROM nginx:stable

# COPY frontends/core/bundle /var/www/multiverse.my.to/public/
# COPY ./nginx.conf /etc/nginx/nginx.conf

# CMD ["nginx-debug", "-g daemon off;"]


FROM node:18-alpine AS slim

RUN apk update

RUN apk add nginx

COPY frontends/core/bundle /var/www/multiverse.my.to/public/
COPY ./nginx.conf /etc/nginx/nginx.conf

COPY frontends/core/create-env.mjs .

RUN printf "#!/bin/bash\r\n\
node ./create-env.mjs \r\n\
nginx -g 'daemon off;'\r\n" >> start.sh

RUN chmod +x start.sh

CMD ["sh", "start.sh"]