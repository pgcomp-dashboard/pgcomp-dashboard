#!/bin/bash

# exit immediately if any command returns != 0
set -e

cd /var/www/html/backend || exit 1

DB_CONNECTION=$(php artisan tinker --execute="echo config('database.default');")
DB_USERNAME=$(php artisan tinker --execute="echo config('database.connections.$DB_CONNECTION.username');")
DB_PASSWORD=$(php artisan tinker --execute="echo config('database.connections.$DB_CONNECTION.password');")
DB_HOST=$(php artisan tinker --execute="echo config('database.connections.$DB_CONNECTION.host');")

until mysqladmin ping -h "$DB_HOST" -u "$DB_USERNAME" -p"$DB_PASSWORD" --connect-timeout=3; do
  >&2 echo "Mysql is unavailable - sleeping 3 seconds"
  sleep 3
done

exit 0
