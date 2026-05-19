-- Migration: auth_hardening
-- Adiciona tabela de tokens para recuperação de senha

CREATE TABLE "tokens_recuperacao_senha" (
    "id"         TEXT         NOT NULL,
    "usuarioId"  TEXT         NOT NULL,
    "token"      TEXT         NOT NULL,
    "expiresAt"  TIMESTAMP(3) NOT NULL,
    "usedAt"     TIMESTAMP(3),
    "criadoEm"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_recuperacao_senha_pkey" PRIMARY KEY ("id")
);

-- Índices
CREATE UNIQUE INDEX "tokens_recuperacao_senha_token_key" ON "tokens_recuperacao_senha"("token");
CREATE INDEX "tokens_recuperacao_senha_token_idx"     ON "tokens_recuperacao_senha"("token");
CREATE INDEX "tokens_recuperacao_senha_usuarioId_idx" ON "tokens_recuperacao_senha"("usuarioId");

-- Chave estrangeira
ALTER TABLE "tokens_recuperacao_senha"
    ADD CONSTRAINT "tokens_recuperacao_senha_usuarioId_fkey"
    FOREIGN KEY ("usuarioId")
    REFERENCES "usuarios"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
