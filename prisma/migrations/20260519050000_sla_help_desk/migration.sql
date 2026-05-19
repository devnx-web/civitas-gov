-- CreateEnum
CREATE TYPE "NivelSLA" AS ENUM ('critico', 'alto', 'medio', 'baixo');

-- CreateEnum
CREATE TYPE "StatusSLA" AS ENUM ('dentro_prazo', 'em_risco', 'vencido');

-- CreateTable
CREATE TABLE "configuracoes_sla" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nivel" "NivelSLA" NOT NULL,
    "prazoHoras" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_sla_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_sla_tenantId_nivel_key" ON "configuracoes_sla"("tenantId", "nivel");

-- AlterTable
ALTER TABLE "tickets_suporte"
    ADD COLUMN "nivelSLA" "NivelSLA",
    ADD COLUMN "prazoResolucao" TIMESTAMP(3),
    ADD COLUMN "statusSLA" "StatusSLA";

-- AddForeignKey
ALTER TABLE "configuracoes_sla" ADD CONSTRAINT "configuracoes_sla_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
