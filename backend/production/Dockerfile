# -----------------------
# Stage 1: Composer Dependencies
# -----------------------
FROM composer:2 AS composer

WORKDIR /app

# Copy only composer files to leverage Docker cache
COPY composer.json composer.lock ./

# Install production dependencies (without dev dependencies)
RUN composer install --no-dev --optimize-autoloader --no-scripts

# -----------------------
# Stage 2: Application Image with Nginx, PHP-FPM, and Supervisor
# -----------------------
FROM php:8.4-fpm-alpine

# Install required packages: system libraries, Nginx, Supervisor, and build dependencies for PECL extensions
RUN apk add --no-cache nginx supervisor

ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN install-php-extensions gd pdo pdo_mysql redis

# Make PHP-FPM log all errors into stderr
RUN printf "[global]\nerror_log = /proc/self/fd/2" > /usr/local/etc/php-fpm.d/logs.conf

# Copy Nginx configuration (assumes nginx.conf is in the build context)
# This configuration directs requests for PHP files to the PHP-FPM backend.
COPY production/nginx.conf /etc/nginx/nginx.conf

# Set the working directory for the Laravel application
WORKDIR /var/www/html

# Copy Composer-installed vendor directory from stage 1
COPY --from=composer /app/vendor ./vendor

# Copy the rest of your Laravel application code (including the 'public' folder)
COPY . .

# Set production environment variables for Laravel
ENV APP_ENV=production \
    APP_DEBUG=false

# Set permissions for storage and cache directories so Laravel can write to them
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Optionally, optimize the Laravel application (caching routes and views)
RUN php artisan view:cache && \
    php artisan route:cache

# Copy the Supervisor configuration file (assumes supervisord.conf is in the build context)
COPY production/supervisord.conf /etc/supervisord.conf

# Expose port 80 to be used by Nginx
EXPOSE 8080

COPY --chmod=755 production/docker-entrypoint.sh /

# Start Supervisor (which in turn starts both PHP-FPM and Nginx)
CMD ["/docker-entrypoint.sh"]
