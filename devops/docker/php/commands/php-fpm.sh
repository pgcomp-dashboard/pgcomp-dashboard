#!/bin/bash

# exit immediately if any command returns != 0
set -e

# Production entrypoint
cd /var/www/html/backend || exit

composer dump-autoload -o
php artisan optimize
php artisan storage:link

/bin/bash /wait-for-mysql.bash

php artisan migrate --force
php artisan up

php-fpm
