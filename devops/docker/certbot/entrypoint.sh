#!/bin/sh

trap exit TERM
while :; do
  certbot renew --deploy-hook "touch /etc/letsencrypt/restart-nginx"
  sleep 12h &
  wait ${!}
done
