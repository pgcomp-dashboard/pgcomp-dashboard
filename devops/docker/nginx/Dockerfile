FROM nginx:stable-alpine as base

################################ Develop #########################
FROM base as develop

################################ Production #########################
FROM base as production

COPY devops/docker/nginx/prod-command.sh /prod-command.sh
COPY backend/public /var/www/html/backend/public
COPY frontend/dist /var/www/html/frontend/dist
COPY frontend-admin/dist /var/www/html/frontend-admin/dist
COPY devops/docker/nginx/nginx-prod.nginx /etc/nginx/conf.d/default.conf
RUN ln -s /var/www/html/backend/storage/app/public /var/www/html/backend/public/storage
