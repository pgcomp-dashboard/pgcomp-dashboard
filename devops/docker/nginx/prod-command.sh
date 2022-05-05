#!/bin/sh

while :; do
  sleep 6h &
  wait ${!}
  test -f /etc/letsencrypt/restart-nginx && rm -f /etc/letsencrypt/restart-nginx && nginx -s reload
done &

nginx -g "daemon off;"
