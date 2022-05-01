#!/bin/sh

# exit immediately if any command returns != 0
set -e

cd /var/www/html/backend || exit 1
composer dump-autoload
php artisan optimize
php artisan storage:link

/bin/bash /wait-for-mysql.bash

php artisan migrate
php artisan test

exit 0
