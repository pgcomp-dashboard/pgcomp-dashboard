#!/bin/bash

# exit immediately if any command returns != 0
set -e

cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

/bin/bash /wait-for-mysql.bash

cd /var/www/html/backend || exit 1
php artisan queue:work
