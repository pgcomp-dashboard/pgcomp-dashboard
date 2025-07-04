#!/usr/bin/env sh

php artisan config:clear && php artisan config:cache
php artisan app:initialize-cron-job-default-redis
exec supervisord -c /etc/supervisord.conf
