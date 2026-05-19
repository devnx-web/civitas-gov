-- Wave 6D: 2FA TOTP, Lotes/Validade, LGPD RoPA, AgenteContratacao

-- ─── 2FA TOTP ─────────────────────────────────────────────────────────────────
ALTER TABLE "usuarios"
  ADD COLUMN "totpSecret"  TEXT,
  ADD COLUMN "totpAtivado" BOOLEAN NOT NULL DEFAULT false;

-- ─── Lotes de Estoque ─────────────────────────────────────────────────────────
CREATE TABLE "lotes_estoque" (
  "id"              TEXT          NOT NULL,
  "estoqueId"       TEXT          NOT NULL,
  "numero"          TEXT          NOT NULL,
  "fabricante"      TEXT,
  "dataFabricacao"  TIMESTAMP(3),
  "dataValidade"    TIMESTAMP(3),
  "quantidadeAtual" DECIMAL(18,4) NOT NULL,
  "criadoEm"        TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm"    TIMESTAMP(3)  NOT NULL,

  CONSTRAINT "lotes_estoque_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "lotes_estoque_estoqueId_dataValidade_idx"
  ON "lotes_estoque"("estoqueId", "dataValidade");

ALTER TABLE "lotes_estoque"
  ADD CONSTRAINT "lotes_estoque_estoqueId_fkey"
  FOREIGN KEY ("estoqueId") REFERENCES "estoques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── CategoriasDadosTratados enum ─────────────────────────────────────────────
CREATE TYPE "CategoriasDadosTratados" AS ENUM (
  'dados_comuns',
  'dados_sensiveis',
  'dados_criancas'
);

-- ─── LGPD RoPA ────────────────────────────────────────────────────────────────
CREATE TABLE "registros_atividade_tratamento" (
  "id"                           TEXT          NOT NULL,
  "tenantId"                     TEXT          NOT NULL,
  "nome"                         TEXT          NOT NULL,
  "finalidade"                   TEXT          NOT NULL,
  "baseLegal"                    "BaseLegalLGPD" NOT NULL,
  "categoriasDados"              "CategoriasDadosTratados"[],
  "titulares"                    TEXT          NOT NULL,
  "compartilhamento"             TEXT,
  "transferenciasInternacionais" TEXT,
  "prazoRetencao"                TEXT          NOT NULL,
  "medidasSeguranca"             TEXT          NOT NULL,
  "dpoId"                        TEXT,
  "criadoEm"                     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm"                 TIMESTAMP(3)  NOT NULL,

  CONSTRAINT "registros_atividade_tratamento_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "registros_atividade_tratamento_tenantId_idx"
  ON "registros_atividade_tratamento"("tenantId");

ALTER TABLE "registros_atividade_tratamento"
  ADD CONSTRAINT "registros_atividade_tratamento_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Agentes de Contratação ───────────────────────────────────────────────────
CREATE TABLE "agentes_contratacao" (
  "id"             TEXT         NOT NULL,
  "tenantId"       TEXT         NOT NULL,
  "usuarioId"      TEXT,
  "nome"           TEXT         NOT NULL,
  "matricula"      TEXT,
  "portaria"       TEXT,
  "vigenciaInicio" TIMESTAMP(3) NOT NULL,
  "vigenciaFim"    TIMESTAMP(3),
  "ativo"          BOOLEAN      NOT NULL DEFAULT true,
  "criadoEm"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "agentes_contratacao_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "agentes_contratacao_tenantId_ativo_idx"
  ON "agentes_contratacao"("tenantId", "ativo");

ALTER TABLE "agentes_contratacao"
  ADD CONSTRAINT "agentes_contratacao_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
