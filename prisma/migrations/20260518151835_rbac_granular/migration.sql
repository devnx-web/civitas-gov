-- CreateEnum
CREATE TYPE "Escopo" AS ENUM ('licitacoes', 'contratos', 'fornecedores', 'almoxarifado', 'patrimonio', 'transparencia', 'configuracoes', 'usuarios', 'auditoria', 'relatorios', 'orcamento', 'financeiro');

-- CreateEnum
CREATE TYPE "Operacao" AS ENUM ('visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar');

-- CreateTable
CREATE TABLE "permissoes" (
    "id" TEXT NOT NULL,
    "escopo" "Escopo" NOT NULL,
    "operacao" "Operacao" NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "permissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissoes" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "permissaoId" TEXT NOT NULL,

    CONSTRAINT "role_permissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_permissoes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "permissaoId" TEXT NOT NULL,
    "concedido" BOOLEAN NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_permissoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permissoes_escopo_operacao_key" ON "permissoes"("escopo", "operacao");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissoes_role_permissaoId_key" ON "role_permissoes"("role", "permissaoId");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_permissoes_tenantId_usuarioId_permissaoId_key" ON "usuario_permissoes"("tenantId", "usuarioId", "permissaoId");

-- AddForeignKey
ALTER TABLE "role_permissoes" ADD CONSTRAINT "role_permissoes_permissaoId_fkey" FOREIGN KEY ("permissaoId") REFERENCES "permissoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_permissoes" ADD CONSTRAINT "usuario_permissoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_permissoes" ADD CONSTRAINT "usuario_permissoes_permissaoId_fkey" FOREIGN KEY ("permissaoId") REFERENCES "permissoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
