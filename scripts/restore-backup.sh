#!/usr/bin/env bash
# Uso: ./scripts/restore-backup.sh <arquivo.dump> <DATABASE_URL>
# Testa conectividade antes de restaurar.
set -euo pipefail

DUMP_FILE="${1:?Informe o arquivo .dump como primeiro argumento}"
DB_URL="${2:-${DATABASE_URL:?Informe DATABASE_URL como segundo argumento ou via variável de ambiente}}"

echo "→ Testando conexão..."
psql "$DB_URL" -c "SELECT 1" > /dev/null

echo "→ Restaurando $DUMP_FILE..."
pg_restore --clean --if-exists --no-owner --no-acl -d "$DB_URL" "$DUMP_FILE"

echo "✓ Restore concluído."
