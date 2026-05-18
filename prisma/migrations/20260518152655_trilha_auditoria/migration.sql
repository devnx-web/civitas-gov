-- CreateEnum
CREATE TYPE "AcaoAuditoria" AS ENUM ('CRIAR', 'ATUALIZAR', 'EXCLUIR');

-- CreateTable
CREATE TABLE "auditorias" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "acao" "AcaoAuditoria" NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "antes" JSONB,
    "depois" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditorias_tenantId_criadoEm_idx" ON "auditorias"("tenantId", "criadoEm" DESC);

-- CreateIndex
CREATE INDEX "auditorias_tenantId_entidade_entidadeId_idx" ON "auditorias"("tenantId", "entidade", "entidadeId");
