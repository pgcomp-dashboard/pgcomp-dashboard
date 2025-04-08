FROM php:8.3-fpm-alpine AS base

ARG UID=1000
ARG GID=1000

RUN test -n "$UID" || (echo "ERROR: UID is not set" && false)
RUN test -n "$GID" || (echo "ERROR: GID is not set" && false)

RUN apk add --no-cache shadow openssl bash nano freetype-dev libjpeg-turbo-dev libpng-dev libzip-dev \
            $PHPIZE_DEPS mysql-client mariadb-connector-c-dev linux-headers \
  && docker-php-ext-install pdo pdo_mysql zip \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j$(nproc) gd \
  && pecl install redis \
  && docker-php-ext-enable redis

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
  && chmod +x /usr/local/bin/composer

RUN mkdir -p /home/www-data \
  && echo "PS1='\w\$ '" > /home/www-data/.bashrc

RUN usermod -u "$UID" www-data && groupmod -g "$GID" www-data

COPY devops/docker/php/commands/cron.sh /cron.sh
COPY devops/docker/php/commands/queue.sh /queue.sh
COPY devops/docker/php/commands/wait-for-mysql.bash /wait-for-mysql.bash
RUN chmod +x /cron.sh /queue.sh /wait-for-mysql.bash

######################### Develop #############################################
FROM base AS develop

RUN pecl install xdebug \
  && docker-php-ext-enable xdebug

USER www-data

######################### Production ##########################################
FROM base as production

COPY devops/docker/php/prod.ini /usr/local/etc/php/conf.d/user.ini
COPY devops/docker/php/commands/php-fpm.sh /php-fpm.sh
RUN chmod +x /php-fpm.sh

ARG UID=1000
ARG GID=1000

COPY --chown=$UID:$GID backend /var/www/html/backend

RUN chmod -R 777 /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache

USER www-data

RUN cd /var/www/html/backend \
  && composer install --no-dev -o --no-ansi --no-interaction --no-scripts --no-progress --prefer-dist

WORKDIR /var/www/html/backend
