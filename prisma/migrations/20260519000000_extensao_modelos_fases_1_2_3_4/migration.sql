-- Migração: extensao_modelos_fases_1_2_3_4
-- Adiciona modelos das Fases 1 (CentroCusto, UnidadeGestora, Setor, Comissao, MembroComissao),
-- Fase 2 (MovimentacaoEstoque, RequisicaoMaterial, ItemRequisicaoMaterial),
-- Fase 3 (TermoGuardaResponsabilidade, BemTermo, TransferenciaPatrimonial),
-- Fase 4 (SancaoFornecedor)

-- CreateEnum
CREATE TYPE "TipoComissao" AS ENUM ('contratacao', 'licitacao', 'inventario_patrimonio', 'inventario_almoxarifado', 'recebimento');

-- CreateEnum
CREATE TYPE "FuncaoMembroComissao" AS ENUM ('presidente', 'membro', 'suplente', 'secretario');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('entrada_nf', 'entrada_ordem_compra', 'entrada_doacao', 'entrada_devolucao', 'entrada_ajuste', 'saida_requisicao', 'saida_consumo_imediato', 'saida_baixa', 'saida_transferencia', 'saida_ajuste');

-- CreateEnum
CREATE TYPE "StatusRequisicao" AS ENUM ('rascunho', 'enviada', 'parcialmente_atendida', 'atendida', 'rejeitada', 'cancelada');

-- CreateEnum
CREATE TYPE "StatusTermo" AS ENUM ('emitido', 'aceito', 'substituido', 'cancelado');

-- CreateEnum
CREATE TYPE "TipoSancao" AS ENUM ('advertencia', 'multa', 'suspensao_temporaria', 'declaracao_inidoneidade', 'impedimento_licitar');

-- CreateTable
CREATE TABLE "centros_custo" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "centros_custo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades_gestoras" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "gestor" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unidades_gestoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setores" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidadeGestoraId" TEXT,
    "centroCustoId" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "setores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comissoes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tipo" "TipoComissao" NOT NULL,
    "nome" TEXT NOT NULL,
    "decreto" TEXT NOT NULL,
    "vigenciaInicio" TIMESTAMP(3) NOT NULL,
    "vigenciaFim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membros_comissao" (
    "id" TEXT NOT NULL,
    "comissaoId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "nomeCompleto" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "funcao" "FuncaoMembroComissao",
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membros_comissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_estoque" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "almoxarifadoId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "quantidade" DECIMAL(18,4) NOT NULL,
    "valorUnitario" DECIMAL(18,4) NOT NULL,
    "valorTotal" DECIMAL(18,4) NOT NULL,
    "precoMedioAposMovimento" DECIMAL(18,4) NOT NULL,
    "notaFiscal" TEXT,
    "ordemCompra" TEXT,
    "empenhoId" TEXT,
    "requisicaoId" TEXT,
    "transferenciaPairId" TEXT,
    "responsavelId" TEXT,
    "centroCustoId" TEXT,
    "observacao" TEXT,
    "dataMovimento" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisicoes_materiais" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "almoxarifadoId" TEXT NOT NULL,
    "setorRequisitanteId" TEXT,
    "centroCustoId" TEXT,
    "solicitanteId" TEXT NOT NULL,
    "responsavelAtendimentoId" TEXT,
    "status" "StatusRequisicao" NOT NULL DEFAULT 'rascunho',
    "justificativa" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "atendidaEm" TIMESTAMP(3),

    CONSTRAINT "requisicoes_materiais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_requisicao_material" (
    "id" TEXT NOT NULL,
    "requisicaoId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantidadeSolicitada" DECIMAL(18,4) NOT NULL,
    "quantidadeAtendida" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "observacao" TEXT,

    CONSTRAINT "itens_requisicao_material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "termos_guarda_responsabilidade" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "setorId" TEXT,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "dataAceite" TIMESTAMP(3),
    "status" "StatusTermo" NOT NULL DEFAULT 'emitido',
    "arquivoDocumentoUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "termos_guarda_responsabilidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bens_termos" (
    "id" TEXT NOT NULL,
    "termoId" TEXT NOT NULL,
    "bemPatrimonialId" TEXT NOT NULL,

    CONSTRAINT "bens_termos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferencias_patrimoniais" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bemPatrimonialId" TEXT NOT NULL,
    "dataTransferencia" TIMESTAMP(3) NOT NULL,
    "deResponsavelId" TEXT,
    "paraResponsavelId" TEXT,
    "deSetorId" TEXT,
    "paraSetorId" TEXT,
    "deLocalizacao" TEXT,
    "paraLocalizacao" TEXT,
    "motivo" TEXT NOT NULL,
    "documentoAutorizadorNumero" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transferencias_patrimoniais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sancoes_fornecedor" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "tipo" "TipoSancao" NOT NULL,
    "processoSancionatorioNumero" TEXT,
    "fundamentoLegal" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "descricao" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sancoes_fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "centros_custo_tenantId_idx" ON "centros_custo"("tenantId");

-- CreateIndex
CREATE INDEX "centros_custo_tenantId_ativo_idx" ON "centros_custo"("tenantId", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "centros_custo_tenantId_codigo_key" ON "centros_custo"("tenantId", "codigo");

-- CreateIndex
CREATE INDEX "unidades_gestoras_tenantId_idx" ON "unidades_gestoras"("tenantId");

-- CreateIndex
CREATE INDEX "unidades_gestoras_tenantId_ativo_idx" ON "unidades_gestoras"("tenantId", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_gestoras_tenantId_codigo_key" ON "unidades_gestoras"("tenantId", "codigo");

-- CreateIndex
CREATE INDEX "setores_tenantId_idx" ON "setores"("tenantId");

-- CreateIndex
CREATE INDEX "setores_tenantId_ativo_idx" ON "setores"("tenantId", "ativo");

-- CreateIndex
CREATE INDEX "comissoes_tenantId_idx" ON "comissoes"("tenantId");

-- CreateIndex
CREATE INDEX "comissoes_tenantId_ativo_idx" ON "comissoes"("tenantId", "ativo");

-- CreateIndex
CREATE INDEX "comissoes_tenantId_tipo_idx" ON "comissoes"("tenantId", "tipo");

-- CreateIndex
CREATE INDEX "membros_comissao_comissaoId_idx" ON "membros_comissao"("comissaoId");

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_tenantId_almoxarifadoId_materialId_idx" ON "movimentacoes_estoque"("tenantId", "almoxarifadoId", "materialId");

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_tenantId_dataMovimento_idx" ON "movimentacoes_estoque"("tenantId", "dataMovimento" DESC);

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_tenantId_tipo_idx" ON "movimentacoes_estoque"("tenantId", "tipo");

-- CreateIndex
CREATE INDEX "requisicoes_materiais_tenantId_status_idx" ON "requisicoes_materiais"("tenantId", "status");

-- CreateIndex
CREATE INDEX "requisicoes_materiais_tenantId_ano_idx" ON "requisicoes_materiais"("tenantId", "ano");

-- CreateIndex
CREATE UNIQUE INDEX "requisicoes_materiais_tenantId_numero_ano_key" ON "requisicoes_materiais"("tenantId", "numero", "ano");

-- CreateIndex
CREATE INDEX "itens_requisicao_material_requisicaoId_idx" ON "itens_requisicao_material"("requisicaoId");

-- CreateIndex
CREATE INDEX "termos_guarda_responsabilidade_tenantId_idx" ON "termos_guarda_responsabilidade"("tenantId");

-- CreateIndex
CREATE INDEX "termos_guarda_responsabilidade_tenantId_status_idx" ON "termos_guarda_responsabilidade"("tenantId", "status");

-- CreateIndex
CREATE INDEX "termos_guarda_responsabilidade_tenantId_responsavelId_idx" ON "termos_guarda_responsabilidade"("tenantId", "responsavelId");

-- CreateIndex
CREATE UNIQUE INDEX "termos_guarda_responsabilidade_tenantId_numero_ano_key" ON "termos_guarda_responsabilidade"("tenantId", "numero", "ano");

-- CreateIndex
CREATE INDEX "bens_termos_termoId_idx" ON "bens_termos"("termoId");

-- CreateIndex
CREATE INDEX "bens_termos_bemPatrimonialId_idx" ON "bens_termos"("bemPatrimonialId");

-- CreateIndex
CREATE UNIQUE INDEX "bens_termos_termoId_bemPatrimonialId_key" ON "bens_termos"("termoId", "bemPatrimonialId");

-- CreateIndex
CREATE INDEX "transferencias_patrimoniais_tenantId_bemPatrimonialId_idx" ON "transferencias_patrimoniais"("tenantId", "bemPatrimonialId");

-- CreateIndex
CREATE INDEX "transferencias_patrimoniais_tenantId_dataTransferencia_idx" ON "transferencias_patrimoniais"("tenantId", "dataTransferencia" DESC);

-- CreateIndex
CREATE INDEX "sancoes_fornecedor_tenantId_fornecedorId_idx" ON "sancoes_fornecedor"("tenantId", "fornecedorId");

-- CreateIndex
CREATE INDEX "sancoes_fornecedor_tenantId_ativa_idx" ON "sancoes_fornecedor"("tenantId", "ativa");

-- CreateIndex
CREATE INDEX "sancoes_fornecedor_tenantId_dataFim_idx" ON "sancoes_fornecedor"("tenantId", "dataFim");

-- AddForeignKey
ALTER TABLE "centros_custo" ADD CONSTRAINT "centros_custo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidades_gestoras" ADD CONSTRAINT "unidades_gestoras_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setores" ADD CONSTRAINT "setores_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setores" ADD CONSTRAINT "setores_unidadeGestoraId_fkey" FOREIGN KEY ("unidadeGestoraId") REFERENCES "unidades_gestoras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setores" ADD CONSTRAINT "setores_centroCustoId_fkey" FOREIGN KEY ("centroCustoId") REFERENCES "centros_custo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membros_comissao" ADD CONSTRAINT "membros_comissao_comissaoId_fkey" FOREIGN KEY ("comissaoId") REFERENCES "comissoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_almoxarifadoId_fkey" FOREIGN KEY ("almoxarifadoId") REFERENCES "almoxarifados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_empenhoId_fkey" FOREIGN KEY ("empenhoId") REFERENCES "empenhos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_requisicaoId_fkey" FOREIGN KEY ("requisicaoId") REFERENCES "requisicoes_materiais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_centroCustoId_fkey" FOREIGN KEY ("centroCustoId") REFERENCES "centros_custo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_transferenciaPairId_fkey" FOREIGN KEY ("transferenciaPairId") REFERENCES "movimentacoes_estoque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisicoes_materiais" ADD CONSTRAINT "requisicoes_materiais_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisicoes_materiais" ADD CONSTRAINT "requisicoes_materiais_almoxarifadoId_fkey" FOREIGN KEY ("almoxarifadoId") REFERENCES "almoxarifados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisicoes_materiais" ADD CONSTRAINT "requisicoes_materiais_setorRequisitanteId_fkey" FOREIGN KEY ("setorRequisitanteId") REFERENCES "setores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisicoes_materiais" ADD CONSTRAINT "requisicoes_materiais_centroCustoId_fkey" FOREIGN KEY ("centroCustoId") REFERENCES "centros_custo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_requisicao_material" ADD CONSTRAINT "itens_requisicao_material_requisicaoId_fkey" FOREIGN KEY ("requisicaoId") REFERENCES "requisicoes_materiais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_requisicao_material" ADD CONSTRAINT "itens_requisicao_material_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "termos_guarda_responsabilidade" ADD CONSTRAINT "termos_guarda_responsabilidade_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "termos_guarda_responsabilidade" ADD CONSTRAINT "termos_guarda_responsabilidade_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "setores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bens_termos" ADD CONSTRAINT "bens_termos_termoId_fkey" FOREIGN KEY ("termoId") REFERENCES "termos_guarda_responsabilidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bens_termos" ADD CONSTRAINT "bens_termos_bemPatrimonialId_fkey" FOREIGN KEY ("bemPatrimonialId") REFERENCES "bens_patrimoniais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_patrimoniais" ADD CONSTRAINT "transferencias_patrimoniais_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_patrimoniais" ADD CONSTRAINT "transferencias_patrimoniais_bemPatrimonialId_fkey" FOREIGN KEY ("bemPatrimonialId") REFERENCES "bens_patrimoniais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_patrimoniais" ADD CONSTRAINT "transferencias_patrimoniais_deSetorId_fkey" FOREIGN KEY ("deSetorId") REFERENCES "setores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_patrimoniais" ADD CONSTRAINT "transferencias_patrimoniais_paraSetorId_fkey" FOREIGN KEY ("paraSetorId") REFERENCES "setores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sancoes_fornecedor" ADD CONSTRAINT "sancoes_fornecedor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sancoes_fornecedor" ADD CONSTRAINT "sancoes_fornecedor_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
