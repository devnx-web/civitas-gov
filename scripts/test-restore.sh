#!/usr/bin/env bash
# Teste de restore: faz dump do banco atual, restaura em banco temporário
# e verifica se a tabela 'usuarios' existe.
# Uso: ./scripts/test-restore.sh [DATABASE_URL]
set -euo pipefail

DB_URL="${1:-${DATABASE_URL:?Informe DATABASE_URL como primeiro argumento ou via variável de ambiente}}"
TMP_DB="civitas_restore_test_$$"
DUMP_FILE="/tmp/${TMP_DB}.dump"

# Extrai host/port/user do DATABASE_URL para criação do banco temporário
PG_URL_NO_DB=$(echo "$DB_URL" | sed 's|/[^/]*$|/postgres|')

cleanup() {
  echo "→ Limpando banco temporário $TMP_DB..."
  psql "$PG_URL_NO_DB" -c "DROP DATABASE IF EXISTS $TMP_DB;" 2>/dev/null || true
  rm -f "$DUMP_FILE"
  echo "✓ Limpeza concluída."
}
trap cleanup EXIT

echo "→ Testando conexão com banco de origem..."
psql "$DB_URL" -c "SELECT 1" > /dev/null

echo "→ Criando dump do banco atual..."
pg_dump "$DB_URL" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file="$DUMP_FILE"

echo "→ Criando banco temporário $TMP_DB..."
psql "$PG_URL_NO_DB" -c "CREATE DATABASE $TMP_DB;" > /dev/null

TMP_DB_URL=$(echo "$DB_URL" | sed "s|/[^/]*$|/$TMP_DB|")

echo "→ Restaurando dump no banco temporário..."
pg_restore --clean --if-exists --no-owner --no-acl -d "$TMP_DB_URL" "$DUMP_FILE"

echo "→ Verificando existência da tabela 'usuarios'..."
RESULT=$(psql "$TMP_DB_URL" -tAc \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'usuarios' AND table_schema = 'public';")

if [ "$RESULT" -eq "1" ]; then
  echo "✓ Tabela 'usuarios' encontrada — restore validado com sucesso!"
else
  echo "✗ Tabela 'usuarios' NÃO encontrada — restore pode ter falhado!" >&2
  exit 1
fi
