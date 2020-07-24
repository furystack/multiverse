
FROM nginx:stable

COPY frontends/core/bundle /var/www/multiverse.my.to/public/
COPY ./nginx.conf /etc/nginx/nginx.conf

CMD ["nginx-debug", "-g daemon off;"]