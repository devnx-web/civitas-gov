-- CreateEnum
CREATE TYPE "StatusIncidenteLGPD" AS ENUM ('detectado', 'em_contencao', 'notificado_anpd', 'notificado_titular', 'encerrado');

-- CreateEnum
CREATE TYPE "GravidadeIncidente" AS ENUM ('baixa', 'media', 'alta', 'critica');

-- CreateTable: IncidenteLGPD
CREATE TABLE "incidentes_lgpd" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "gravidade" "GravidadeIncidente" NOT NULL,
    "status" "StatusIncidenteLGPD" NOT NULL DEFAULT 'detectado',
    "dataDeteccao" TIMESTAMP(3) NOT NULL,
    "dataContencao" TIMESTAMP(3),
    "dataNotificacaoAnpd" TIMESTAMP(3),
    "dataNotificacaoTitular" TIMESTAMP(3),
    "prazoAnpd72h" TIMESTAMP(3) NOT NULL,
    "numeroProtocoloAnpd" TEXT,
    "titularesAfetados" INTEGER NOT NULL DEFAULT 0,
    "dadosComprometidos" TEXT NOT NULL,
    "medidasAdotadas" TEXT,
    "responsavelId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidentes_lgpd_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "incidentes_lgpd_tenantId_status_idx" ON "incidentes_lgpd"("tenantId", "status");

-- AddForeignKey
ALTER TABLE "incidentes_lgpd" ADD CONSTRAINT "incidentes_lgpd_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: DPO
CREATE TABLE "dpos" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "empresa" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dpos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (unique tenantId on dpos)
CREATE UNIQUE INDEX "dpos_tenantId_key" ON "dpos"("tenantId");

-- AddForeignKey
ALTER TABLE "dpos" ADD CONSTRAINT "dpos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
