#!/bin/bash

# exit immediately if any command returns != 0
set -e

user="www-data"
currentCrontab="$(crontab -u $user -l)"
command="* * * * * cd /var/www/html/backend && php artisan schedule:run >> /dev/null 2>&1"

if [[ "${currentCrontab}" == *"artisan schedule:run"* ]]; then
  echo "Crontab already installed"
else
  echo "Installing crontab"
  currentCrontab="${currentCrontab}\n###### Laravel schedule ######"
  currentCrontab="${currentCrontab}\n${command}"
  currentCrontab="${currentCrontab}\n###### Laravel schedule ######\n"
  echo -e "${currentCrontab}" | crontab -u $user -
fi

cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

/bin/bash /wait-for-mysql.bash

echo -e "Running crond -f\n"

crond -f
