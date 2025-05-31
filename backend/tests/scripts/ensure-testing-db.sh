#!/usr/bin/env bash
set -euo pipefail

# Carrega variáveis do .env
export $(grep -E '^(DB_USERNAME|DB_PASSWORD|DB_ROOT_PASSWORD)=' .env | xargs)

BACKUP_FILE=${1:-backup.sql}
DB_NAME=${2:-testing}
DB_USER=${DB_USERNAME:-sail}
DB_PASS=${DB_PASSWORD:-password}
DB_ROOT_PASS=${DB_ROOT_PASSWORD:-password}

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "❌ Arquivo de backup não encontrado: $BACKUP_FILE"
  exit 1
fi

echo "🔄 Garantindo existência do banco '$DB_NAME' (usando root)..."
./vendor/bin/sail exec mysql \
  env MYSQL_PWD="$DB_ROOT_PASS" \
  mysql -u root \
  -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "🔄 Garantindo privilégios de $DB_USER em '$DB_NAME'..."
./vendor/bin/sail exec mysql \
  env MYSQL_PWD="$DB_ROOT_PASS" \
  mysql -u root \
  -e "GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'%'; FLUSH PRIVILEGES;"

echo "🔄 Copiando backup para o container..."
CONTAINER=$(./vendor/bin/sail ps -q mysql)
docker cp "$BACKUP_FILE" "$CONTAINER":/tmp/backup.sql

echo "🔄 Importando '/tmp/backup.sql' para o banco '$DB_NAME' (usando $DB_USER)..."
./vendor/bin/sail exec mysql \
  sh -c "env MYSQL_PWD=\"$DB_PASS\" mysql -u\"$DB_USER\" \"$DB_NAME\" < /tmp/backup.sql"

echo "✅ Banco '$DB_NAME' sincronizado com '$BACKUP_FILE'"
