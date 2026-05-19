-- Wave 6A: Inventário Patrimonial Formal, e-SIC LAI persistência, Receitas
-- Data: 2026-05-19 | Fuso: GMT-3

-- ─── Enums — Inventário Patrimonial ─────────────────────────────────────────
CREATE TYPE "StatusInventario" AS ENUM ('aberto', 'em_contagem', 'em_conciliacao', 'encerrado', 'cancelado');
CREATE TYPE "ResultadoItemInventario" AS ENUM ('confirmado', 'nao_localizado', 'divergencia_valor', 'excedente');

-- ─── Inventário Patrimonial ──────────────────────────────────────────────────
CREATE TABLE "inventarios_patrimoniais" (
    "id"               TEXT NOT NULL,
    "tenantId"         TEXT NOT NULL,
    "exercicio"        INTEGER NOT NULL,
    "numero"           TEXT NOT NULL,
    "dataAbertura"     TIMESTAMP(3) NOT NULL,
    "dataEncerramento" TIMESTAMP(3),
    "status"           "StatusInventario" NOT NULL DEFAULT 'aberto',
    "comissaoId"       TEXT,
    "observacoes"      TEXT,
    "criadoPorId"      TEXT NOT NULL,
    "criadoEm"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventarios_patrimoniais_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "itens_inventario" (
    "id"                    TEXT NOT NULL,
    "inventarioId"          TEXT NOT NULL,
    "bemPatrimonialId"      TEXT NOT NULL,
    "localizacaoEsperada"   TEXT,
    "localizacaoEncontrada" TEXT,
    "valorContabil"         DECIMAL(18,2) NOT NULL,
    "resultado"             "ResultadoItemInventario",
    "observacoes"           TEXT,
    "conferidoPorId"        TEXT,
    "conferidoEm"           TIMESTAMP(3),

    CONSTRAINT "itens_inventario_pkey" PRIMARY KEY ("id")
);

-- Índices — Inventário
CREATE UNIQUE INDEX "inventarios_patrimoniais_tenantId_numero_exercicio_key"
    ON "inventarios_patrimoniais"("tenantId", "numero", "exercicio");
CREATE INDEX "inventarios_patrimoniais_tenantId_status_idx"
    ON "inventarios_patrimoniais"("tenantId", "status");
CREATE UNIQUE INDEX "itens_inventario_inventarioId_bemPatrimonialId_key"
    ON "itens_inventario"("inventarioId", "bemPatrimonialId");
CREATE INDEX "itens_inventario_inventarioId_idx"
    ON "itens_inventario"("inventarioId");

-- FK — Inventário
ALTER TABLE "inventarios_patrimoniais"
    ADD CONSTRAINT "inventarios_patrimoniais_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventarios_patrimoniais"
    ADD CONSTRAINT "inventarios_patrimoniais_comissaoId_fkey"
    FOREIGN KEY ("comissaoId") REFERENCES "comissoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "itens_inventario"
    ADD CONSTRAINT "itens_inventario_inventarioId_fkey"
    FOREIGN KEY ("inventarioId") REFERENCES "inventarios_patrimoniais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "itens_inventario"
    ADD CONSTRAINT "itens_inventario_bemPatrimonialId_fkey"
    FOREIGN KEY ("bemPatrimonialId") REFERENCES "bens_patrimoniais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── Enums — e-SIC ───────────────────────────────────────────────────────────
CREATE TYPE "StatusSolicitacaoSIC" AS ENUM ('recebida', 'em_tramitacao', 'respondida', 'prorrogada', 'negada', 'encaminhada');

-- ─── e-SIC ───────────────────────────────────────────────────────────────────
CREATE TABLE "solicitacoes_esic" (
    "id"               TEXT NOT NULL,
    "tenantId"         TEXT NOT NULL,
    "protocolo"        TEXT NOT NULL,
    "solicitanteNome"  TEXT NOT NULL,
    "solicitanteEmail" TEXT NOT NULL,
    "solicitanteCpf"   TEXT,
    "descricao"        TEXT NOT NULL,
    "status"           "StatusSolicitacaoSIC" NOT NULL DEFAULT 'recebida',
    "resposta"         TEXT,
    "dataResposta"     TIMESTAMP(3),
    "prazoLegal"       TIMESTAMP(3) NOT NULL,
    "prorrogadoAte"    TIMESTAMP(3),
    "responsavelId"    TEXT,
    "criadoEm"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_esic_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "solicitacoes_esic_protocolo_key" ON "solicitacoes_esic"("protocolo");
CREATE INDEX "solicitacoes_esic_tenantId_status_idx" ON "solicitacoes_esic"("tenantId", "status");
CREATE INDEX "solicitacoes_esic_protocolo_idx" ON "solicitacoes_esic"("protocolo");

ALTER TABLE "solicitacoes_esic"
    ADD CONSTRAINT "solicitacoes_esic_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Enums — Receitas ────────────────────────────────────────────────────────
CREATE TYPE "TipoReceita" AS ENUM ('tributaria', 'patrimonial', 'de_servicos', 'transferencias_correntes', 'operacoes_credito', 'outras');
CREATE TYPE "StatusReceita" AS ENUM ('prevista', 'lancada', 'arrecadada', 'cancelada');

-- ─── Receitas ─────────────────────────────────────────────────────────────────
CREATE TABLE "receitas" (
    "id"              TEXT NOT NULL,
    "tenantId"        TEXT NOT NULL,
    "exercicio"       INTEGER NOT NULL,
    "mes"             INTEGER NOT NULL,
    "tipo"            "TipoReceita" NOT NULL,
    "natureza"        TEXT NOT NULL,
    "descricao"       TEXT NOT NULL,
    "valorPrevisto"   DECIMAL(18,2) NOT NULL,
    "valorArrecadado" DECIMAL(18,2),
    "status"          "StatusReceita" NOT NULL DEFAULT 'prevista',
    "fonte"           TEXT,
    "criadoEm"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receitas_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "receitas_tenantId_exercicio_mes_idx" ON "receitas"("tenantId", "exercicio", "mes");

ALTER TABLE "receitas"
    ADD CONSTRAINT "receitas_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
