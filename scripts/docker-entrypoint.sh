#!/bin/sh
set -e

echo "========================================"
echo "  Civitas Gov — Inicializando..."
echo "========================================"

# Aguarda o banco de dados ficar disponível
echo "⏳ Aguardando PostgreSQL..."
# Extrai host da DATABASE_URL (formato: postgresql://user:pass@host:port/db)
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')

until wget -qO- "$DATABASE_URL" > /dev/null 2>&1 || nc -z "$DB_HOST" 5432 2>/dev/null; do
  echo "   PostgreSQL ($DB_HOST) ainda não está pronto..."
  sleep 2
done
echo "✅ PostgreSQL disponível."

# Roda as migrações do Prisma
echo "🔄 Aplicando migrações do banco de dados..."
npx prisma migrate deploy

# Gera o Prisma Client (garante que está atualizado)
echo "🔧 Gerando Prisma Client..."
npx prisma generate

# Roda o seed (somente se a variável estiver setada)
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Populando banco com dados iniciais..."
  npx prisma db seed
fi

echo "========================================"
echo "  🚀 Iniciando servidor Next.js..."
echo "========================================"

# Inicia o servidor Next.js standalone
exec node server.js
