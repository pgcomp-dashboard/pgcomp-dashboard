FROM php:8.1-fpm-alpine AS base

ARG UID
ARG GID

RUN test -n "$UID" || (echo "ERROR: UID is not set" && false)
RUN test -n "$GID" || (echo "ERROR: GID is not set" && false)

RUN apk add --no-cache shadow openssl bash nano freetype-dev libjpeg-turbo-dev libpng-dev libzip-dev \
            $PHPIZE_DEPS mysql-client mariadb-connector-c-dev

RUN docker-php-ext-install pdo pdo_mysql zip
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install -j$(nproc) gd
RUN pecl install redis
RUN docker-php-ext-enable redis

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN touch /home/www-data/.bashrc | echo "PS1='\w\$ '" >> /home/www-data/.bashrc

RUN usermod -u "$UID" www-data && groupmod -g "$GID" www-data
######################### Develop #############################################
FROM base AS develop

RUN pecl install xdebug
RUN docker-php-ext-enable xdebug

USER www-data
