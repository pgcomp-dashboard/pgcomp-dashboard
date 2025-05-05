#!/usr/bin/env sh

php artisan config:clear && php artisan config:cache

exec supervisord -c /etc/supervisord.conf
