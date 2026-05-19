-- AlterTable: adiciona coluna observacoes (idempotente para tolerar prisma db push prévio)
ALTER TABLE "contratos" ADD COLUMN IF NOT EXISTS "observacoes" TEXT;
ALTER TABLE "processos_licitatorios" ADD COLUMN IF NOT EXISTS "observacoes" TEXT;
