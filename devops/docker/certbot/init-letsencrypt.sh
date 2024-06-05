#!/bin/bash

if ! [ -x "$(command -v docker compose)" ]; then
  echo 'Error: docker-compose is not installed.' >&2
  exit 1
fi

help() {
    echo "Syntax: sh init-letsencrypt.sh [-d|e|s|w]"
    echo "Options:"
    echo "-d  domains separated by space (min 1)"
    echo "-e  e-mail (required)"
    echo "-s  staging 1 or 0 - default = 1"
    echo "-w  include www 1 or 0 - default = 1"
    echo ""
}

include_www=1
staging=0
rsa_key_size=4096
while getopts ":d:e:s:w:" opt; do
  case $opt in
    d) IFS=', ' read -r -a _domains <<< "$OPTARG"
      for domain in "${_domains[@]}"; do
        domains+=("$domain")
      done
    ;;
    e) email="$OPTARG"
    ;;
    s) staging="$OPTARG"
    ;;
    w) include_www="$OPTARG"
    ;;
    \?) help; echo "Invalid option ${ARG}"; exit 1;;
  esac

  case $OPTARG in
    -*) echo "Option $opt needs a valid argument"
    exit 1
    ;;
  esac
done

if [ "${#domains[@]}" -eq "0" ]; then
   echo "Domains is empty";
   exit 1;
fi

if [ -z "$email" ]; then
   echo "E-mail is empty";
   exit 1;
fi

echo "### Creating letsencrypt path..."
for domain in "${domains[@]}"; do
  path="/etc/letsencrypt/live/$domain"
  docker compose run -T --rm --entrypoint "mkdir -p $path" certbot
  echo
done

echo "### Downloading nginx ssl config..."
nginx_config_url="https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf"
nginx_config_url2="https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem"
docker compose run -T --rm --entrypoint "wget -O /etc/letsencrypt/options-ssl-nginx.conf $nginx_config_url" certbot
docker compose run -T --rm --entrypoint "wget -O /etc/letsencrypt/ssl-dhparams.pem $nginx_config_url2" certbot
echo

for domain in "${domains[@]}"; do
  echo "### Creating dummy certificate for $domain ..."
  path="/etc/letsencrypt/live/$domain"
  docker compose run -T --rm --entrypoint "\
    sh -c '\
      test ! -f $path/privkey.pem && \
      openssl req -x509 -nodes -newkey rsa:1024 -days 1 \
        -keyout $path/privkey.pem \
        -out $path/fullchain.pem \
        -subj /CN=localhost'" certbot
  echo
done

echo "### Starting nginx ..."
docker compose up -d nginx
echo

for domain in "${domains[@]}"; do
  echo "### Deleting dummy certificate for $domain ..."
  docker compose run -T --rm --entrypoint "\
    sh -c '\
      test ! -f /etc/letsencrypt/renewal/$domain.conf && \
      rm -rf /etc/letsencrypt/live/$domain'" certbot
  echo
done

# Select appropriate email arg
case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

# Enable staging mode if needed
if [ $staging != "0" ]; then staging_arg="--staging"; fi

# request certificates
for domain in "${domains[@]}"; do
  echo "### Requesting Let's Encrypt certificate for $domain ..."
  if [ "$include_www" != "0" ]; then www_domain_arg="-d www.$domain"; fi

  docker compose run -T --rm --entrypoint "\
    sh -c '\
    test ! -f /etc/letsencrypt/renewal/$domain.conf && \
    certbot certonly --webroot -w /var/www/certbot \
      $staging_arg \
      $email_arg \
      -d $domain $www_domain_arg \
      --rsa-key-size $rsa_key_size \
      --agree-tos \
      --force-renewal && \
      touch /etc/letsencrypt/restart-nginx'" certbot
  echo
done

echo "### Reloading nginx ..."
docker compose exec -T nginx sh -c 'test -f /etc/letsencrypt/restart-nginx && nginx -s reload && rm /etc/letsencrypt/restart-nginx'

exit 0
