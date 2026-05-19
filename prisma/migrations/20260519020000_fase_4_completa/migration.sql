-- CreateEnum
CREATE TYPE "StatusPCA" AS ENUM ('rascunho', 'em_elaboracao', 'aprovado', 'publicado', 'encerrado');

-- CreateEnum
CREATE TYPE "StatusSolicitacaoCompra" AS ENUM ('rascunho', 'pre_autorizada', 'autorizada', 'negada', 'convertida_processo', 'cancelada');

-- CreateEnum
CREATE TYPE "StatusPesquisaPreco" AS ENUM ('aberta', 'encerrada', 'cancelada');

-- CreateEnum
CREATE TYPE "StatusCotacao" AS ENUM ('rascunho', 'enviada', 'respondida', 'expirada', 'recusada');

-- CreateEnum
CREATE TYPE "StatusEdital" AS ENUM ('rascunho', 'publicado', 'substituido');

-- CreateEnum
CREATE TYPE "TipoAta" AS ENUM ('registro_precos', 'sessao_pregao', 'abertura_envelope', 'julgamento_propostas', 'adjudicacao', 'homologacao', 'outro');

-- CreateEnum
CREATE TYPE "StatusImpugnacao" AS ENUM ('recebida', 'em_analise', 'deferida', 'indeferida', 'prejudicada');

-- CreateEnum
CREATE TYPE "StatusRecurso" AS ENUM ('recebido', 'em_contrarrazoes', 'em_analise', 'deferido', 'indeferido', 'prejudicado');

-- CreateEnum
CREATE TYPE "TipoPregao" AS ENUM ('eletronico', 'presencial');

-- CreateEnum
CREATE TYPE "StatusSessaoPregao" AS ENUM ('agendada', 'aberta', 'em_lance', 'em_negociacao', 'suspensa', 'encerrada', 'fracassada', 'deserta');

-- CreateEnum
CREATE TYPE "TipoLance" AS ENUM ('lance', 'lance_intermediario', 'negociacao');

-- CreateEnum
CREATE TYPE "StatusHabilitacao" AS ENUM ('pendente', 'habilitado', 'inabilitado', 'em_analise');

-- CreateEnum
CREATE TYPE "TipoGarantia" AS ENUM ('caucao_dinheiro', 'seguro_garantia', 'fianca_bancaria', 'titulos_divida_publica');

-- CreateEnum
CREATE TYPE "SituacaoGarantia" AS ENUM ('vigente', 'liberada', 'executada', 'vencida', 'substituida');

-- CreateEnum
CREATE TYPE "CategoriaClausula" AS ENUM ('geral', 'sancao', 'reajuste', 'garantia', 'prazo', 'pagamento', 'rescisao', 'alteracao', 'fiscalizacao');

-- CreateEnum
CREATE TYPE "SituacaoRestoPagar" AS ENUM ('processado', 'nao_processado', 'prescrito', 'cancelado', 'pago');

-- CreateEnum
CREATE TYPE "TipoConvenio" AS ENUM ('concedido', 'recebido', 'termo_cooperacao', 'termo_fomento');

-- CreateEnum
CREATE TYPE "StatusConvenio" AS ENUM ('ativo', 'encerrado', 'rescindido', 'prestacao_pendente', 'prestacao_aprovada', 'prestacao_rejeitada');

-- CreateEnum
CREATE TYPE "StatusParcelaConvenio" AS ENUM ('prevista', 'liberada', 'prestacao_pendente', 'prestacao_aprovada', 'prestacao_rejeitada');

-- CreateEnum
CREATE TYPE "TipoFiscal" AS ENUM ('fiscal_titular', 'fiscal_substituto', 'gestor');

-- CreateEnum
CREATE TYPE "TipoOcorrencia" AS ENUM ('medicao', 'reclamacao', 'nao_conformidade', 'elogio', 'alerta', 'infracao', 'atestado_recebimento');

-- CreateEnum
CREATE TYPE "GravidadeOcorrencia" AS ENUM ('baixa', 'media', 'alta', 'critica');

-- CreateEnum
CREATE TYPE "StatusOcorrencia" AS ENUM ('aberta', 'em_tratamento', 'resolvida', 'escalada', 'arquivada');

-- CreateEnum
CREATE TYPE "StatusMedicao" AS ENUM ('rascunho', 'aprovada', 'paga', 'glosada');

-- CreateTable
CREATE TABLE "pcas" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "status" "StatusPCA" NOT NULL DEFAULT 'rascunho',
    "dataAprovacao" TIMESTAMP(3),
    "dataPublicacao" TIMESTAMP(3),
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pca" (
    "id" TEXT NOT NULL,
    "pcaId" TEXT NOT NULL,
    "materialId" TEXT,
    "descricao" TEXT NOT NULL,
    "quantidadeEstimada" DECIMAL(18,4) NOT NULL,
    "valorUnitarioEstimado" DECIMAL(18,2) NOT NULL,
    "valorTotalEstimado" DECIMAL(18,2) NOT NULL,
    "mesPretendido" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "justificativa" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_pca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes_compra" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "centroCustoId" TEXT,
    "setorId" TEXT,
    "justificativa" TEXT NOT NULL,
    "status" "StatusSolicitacaoCompra" NOT NULL DEFAULT 'rascunho',
    "preAutorizadorId" TEXT,
    "autorizadorId" TEXT,
    "processoLicitatorioId" TEXT,
    "motivoRecusa" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_solicitacao_compra" (
    "id" TEXT NOT NULL,
    "solicitacaoId" TEXT NOT NULL,
    "materialId" TEXT,
    "descricao" TEXT NOT NULL,
    "quantidade" DECIMAL(18,4) NOT NULL,
    "valorUnitarioEstimado" DECIMAL(18,2) NOT NULL,
    "valorTotalEstimado" DECIMAL(18,2) NOT NULL,
    "unidadeMedida" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_solicitacao_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesquisas_preco" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "objeto" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "status" "StatusPesquisaPreco" NOT NULL DEFAULT 'aberta',
    "processoId" TEXT,
    "criadoPorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pesquisas_preco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pesquisa_preco" (
    "id" TEXT NOT NULL,
    "pesquisaId" TEXT NOT NULL,
    "materialId" TEXT,
    "descricao" TEXT NOT NULL,
    "quantidade" DECIMAL(18,4) NOT NULL,
    "unidadeMedida" TEXT,

    CONSTRAINT "itens_pesquisa_preco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotacoes" (
    "id" TEXT NOT NULL,
    "pesquisaId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "tokenAcessoOnline" TEXT,
    "dataEnvio" TIMESTAMP(3),
    "dataResposta" TIMESTAMP(3),
    "valorTotal" DECIMAL(18,2),
    "validadeProposta" TIMESTAMP(3),
    "observacao" TEXT,
    "status" "StatusCotacao" NOT NULL DEFAULT 'rascunho',

    CONSTRAINT "cotacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_cotacao" (
    "id" TEXT NOT NULL,
    "cotacaoId" TEXT NOT NULL,
    "itemPesquisaId" TEXT NOT NULL,
    "valorUnitario" DECIMAL(18,2) NOT NULL,
    "marca" TEXT,
    "prazoEntregaDias" INTEGER,
    "observacao" TEXT,

    CONSTRAINT "itens_cotacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editais" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "processoId" TEXT NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "titulo" TEXT NOT NULL,
    "conteudoHtml" TEXT,
    "arquivoUrl" TEXT,
    "status" "StatusEdital" NOT NULL DEFAULT 'rascunho',
    "publicadoEm" TIMESTAMP(3),
    "publicadoPorId" TEXT,
    "substituidoPorId" TEXT,

    CONSTRAINT "editais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atas" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "processoId" TEXT,
    "tipo" "TipoAta" NOT NULL,
    "numero" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "conteudoHtml" TEXT,
    "arquivoUrl" TEXT,
    "dataLavratura" TIMESTAMP(3) NOT NULL,
    "dataAssinatura" TIMESTAMP(3),
    "criadoPorId" TEXT NOT NULL,
    "validadeInicio" TIMESTAMP(3),
    "validadeFim" TIMESTAMP(3),

    CONSTRAINT "atas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_ata_registro_preco" (
    "id" TEXT NOT NULL,
    "ataId" TEXT NOT NULL,
    "materialId" TEXT,
    "descricao" TEXT NOT NULL,
    "quantidadeRegistrada" DECIMAL(18,4) NOT NULL,
    "saldoDisponivel" DECIMAL(18,4) NOT NULL,
    "valorUnitarioRegistrado" DECIMAL(18,2) NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_ata_registro_preco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impugnacoes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "processoId" TEXT NOT NULL,
    "impugnanteNome" TEXT NOT NULL,
    "impugnanteIdentificador" TEXT NOT NULL,
    "impugnanteEmail" TEXT,
    "dataImpugnacao" TIMESTAMP(3) NOT NULL,
    "conteudo" TEXT NOT NULL,
    "fundamentoLegal" TEXT,
    "status" "StatusImpugnacao" NOT NULL DEFAULT 'recebida',
    "parecerJulgamento" TEXT,
    "julgadoPorId" TEXT,
    "dataJulgamento" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "impugnacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recursos" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "processoId" TEXT NOT NULL,
    "recorrenteFornecedorId" TEXT,
    "recorrenteIdentificador" TEXT NOT NULL,
    "dataInterposicao" TIMESTAMP(3) NOT NULL,
    "dataLimitContrarrazoes" TIMESTAMP(3),
    "conteudo" TEXT NOT NULL,
    "status" "StatusRecurso" NOT NULL DEFAULT 'recebido',
    "contrarrazoes" TEXT,
    "parecerJulgamento" TEXT,
    "dataJulgamento" TIMESTAMP(3),
    "julgadoPorId" TEXT,

    CONSTRAINT "recursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes_pregao" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "processoId" TEXT NOT NULL,
    "dataAbertura" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoPregao" NOT NULL,
    "status" "StatusSessaoPregao" NOT NULL DEFAULT 'agendada',
    "pregoeiroId" TEXT NOT NULL,
    "atasInternas" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encerradoEm" TIMESTAMP(3),

    CONSTRAINT "sessoes_pregao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lances" (
    "id" TEXT NOT NULL,
    "sessaoId" TEXT NOT NULL,
    "itemLicitacaoId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "valor" DECIMAL(18,2) NOT NULL,
    "ordem" INTEGER NOT NULL,
    "tipo" "TipoLance" NOT NULL DEFAULT 'lance',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habilitacoes_fornecedor" (
    "id" TEXT NOT NULL,
    "sessaoId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "status" "StatusHabilitacao" NOT NULL DEFAULT 'pendente',
    "motivo" TEXT,
    "documentos" JSONB,
    "julgadoPorId" TEXT,
    "dataJulgamento" TIMESTAMP(3),

    CONSTRAINT "habilitacoes_fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "garantias" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "tipo" "TipoGarantia" NOT NULL,
    "valor" DECIMAL(18,2) NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "situacao" "SituacaoGarantia" NOT NULL DEFAULT 'vigente',
    "beneficiario" TEXT,
    "numeroDocumento" TEXT,
    "arquivoUrl" TEXT,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "garantias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clausulas_modelo" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudoMd" TEXT NOT NULL,
    "categoria" "CategoriaClausula" NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clausulas_modelo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cronogramas_fisico_financeiros" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "parcela" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataPrevista" TIMESTAMP(3) NOT NULL,
    "valorPrevisto" DECIMAL(18,2) NOT NULL,
    "dataRealizada" TIMESTAMP(3),
    "valorRealizado" DECIMAL(18,2),
    "percentualFisico" DECIMAL(5,2),
    "percentualFinanceiro" DECIMAL(5,2),
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cronogramas_fisico_financeiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restos_pagar" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "exercicio" INTEGER NOT NULL,
    "empenhoId" TEXT NOT NULL,
    "valorInscrito" DECIMAL(18,2) NOT NULL,
    "valorPago" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "valorCancelado" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "saldo" DECIMAL(18,2) NOT NULL,
    "situacao" "SituacaoRestoPagar" NOT NULL DEFAULT 'nao_processado',
    "dataInscricao" TIMESTAMP(3) NOT NULL,
    "dataPrescricao" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restos_pagar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "convenios" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "tipo" "TipoConvenio" NOT NULL,
    "concedenteNome" TEXT NOT NULL,
    "concedenteIdentificador" TEXT NOT NULL,
    "beneficiarioNome" TEXT NOT NULL,
    "beneficiarioIdentificador" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "valorTotal" DECIMAL(18,2) NOT NULL,
    "valorRepasse" DECIMAL(18,2) NOT NULL,
    "valorContrapartida" DECIMAL(18,2) NOT NULL,
    "dataAssinatura" TIMESTAMP(3) NOT NULL,
    "vigenciaInicio" TIMESTAMP(3) NOT NULL,
    "vigenciaFim" TIMESTAMP(3) NOT NULL,
    "status" "StatusConvenio" NOT NULL DEFAULT 'ativo',
    "gestorId" TEXT,
    "processoId" TEXT,
    "arquivoUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "convenios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcelas_convenio" (
    "id" TEXT NOT NULL,
    "convenioId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "dataPrevista" TIMESTAMP(3) NOT NULL,
    "valor" DECIMAL(18,2) NOT NULL,
    "dataLiberacao" TIMESTAMP(3),
    "dataPrestacaoContas" TIMESTAMP(3),
    "status" "StatusParcelaConvenio" NOT NULL DEFAULT 'prevista',
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parcelas_convenio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiscalizacoes_contrato" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "fiscalId" TEXT NOT NULL,
    "tipo" "TipoFiscal" NOT NULL,
    "dataDesignacao" TIMESTAMP(3) NOT NULL,
    "dataEncerramento" TIMESTAMP(3),
    "decretoPortaria" TEXT,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fiscalizacoes_contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocorrencias_fiscalizacao" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "fiscalId" TEXT NOT NULL,
    "dataOcorrencia" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoOcorrencia" NOT NULL,
    "gravidade" "GravidadeOcorrencia" NOT NULL,
    "descricao" TEXT NOT NULL,
    "evidenciaUrl" TEXT,
    "tratamento" TEXT,
    "dataTratamento" TIMESTAMP(3),
    "status" "StatusOcorrencia" NOT NULL DEFAULT 'aberta',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ocorrencias_fiscalizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicoes_contrato" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "fiscalId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "periodoInicio" TIMESTAMP(3) NOT NULL,
    "periodoFim" TIMESTAMP(3) NOT NULL,
    "valorMedido" DECIMAL(18,2) NOT NULL,
    "percentualExecutado" DECIMAL(5,2),
    "status" "StatusMedicao" NOT NULL DEFAULT 'rascunho',
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicoes_contrato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pcas_tenantId_status_idx" ON "pcas"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "pcas_tenantId_ano_key" ON "pcas"("tenantId", "ano");

-- CreateIndex
CREATE INDEX "itens_pca_pcaId_idx" ON "itens_pca"("pcaId");

-- CreateIndex
CREATE INDEX "solicitacoes_compra_tenantId_status_idx" ON "solicitacoes_compra"("tenantId", "status");

-- CreateIndex
CREATE INDEX "solicitacoes_compra_tenantId_solicitanteId_idx" ON "solicitacoes_compra"("tenantId", "solicitanteId");

-- CreateIndex
CREATE UNIQUE INDEX "solicitacoes_compra_tenantId_numero_ano_key" ON "solicitacoes_compra"("tenantId", "numero", "ano");

-- CreateIndex
CREATE INDEX "itens_solicitacao_compra_solicitacaoId_idx" ON "itens_solicitacao_compra"("solicitacaoId");

-- CreateIndex
CREATE INDEX "pesquisas_preco_tenantId_status_idx" ON "pesquisas_preco"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "pesquisas_preco_tenantId_numero_ano_key" ON "pesquisas_preco"("tenantId", "numero", "ano");

-- CreateIndex
CREATE INDEX "itens_pesquisa_preco_pesquisaId_idx" ON "itens_pesquisa_preco"("pesquisaId");

-- CreateIndex
CREATE UNIQUE INDEX "cotacoes_tokenAcessoOnline_key" ON "cotacoes"("tokenAcessoOnline");

-- CreateIndex
CREATE UNIQUE INDEX "cotacoes_pesquisaId_fornecedorId_key" ON "cotacoes"("pesquisaId", "fornecedorId");

-- CreateIndex
CREATE INDEX "itens_cotacao_cotacaoId_idx" ON "itens_cotacao"("cotacaoId");

-- CreateIndex
CREATE INDEX "editais_tenantId_processoId_versao_idx" ON "editais"("tenantId", "processoId", "versao");

-- CreateIndex
CREATE INDEX "atas_tenantId_numero_ano_tipo_idx" ON "atas"("tenantId", "numero", "ano", "tipo");

-- CreateIndex
CREATE INDEX "itens_ata_registro_preco_ataId_idx" ON "itens_ata_registro_preco"("ataId");

-- CreateIndex
CREATE INDEX "impugnacoes_tenantId_processoId_idx" ON "impugnacoes"("tenantId", "processoId");

-- CreateIndex
CREATE INDEX "recursos_tenantId_processoId_idx" ON "recursos"("tenantId", "processoId");

-- CreateIndex
CREATE INDEX "sessoes_pregao_tenantId_processoId_idx" ON "sessoes_pregao"("tenantId", "processoId");

-- CreateIndex
CREATE INDEX "lances_sessaoId_itemLicitacaoId_ordem_idx" ON "lances"("sessaoId", "itemLicitacaoId", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "habilitacoes_fornecedor_sessaoId_fornecedorId_key" ON "habilitacoes_fornecedor"("sessaoId", "fornecedorId");

-- CreateIndex
CREATE INDEX "garantias_tenantId_contratoId_idx" ON "garantias"("tenantId", "contratoId");

-- CreateIndex
CREATE INDEX "garantias_tenantId_situacao_idx" ON "garantias"("tenantId", "situacao");

-- CreateIndex
CREATE INDEX "garantias_tenantId_dataFim_idx" ON "garantias"("tenantId", "dataFim");

-- CreateIndex
CREATE INDEX "clausulas_modelo_tenantId_categoria_ordem_idx" ON "clausulas_modelo"("tenantId", "categoria", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "clausulas_modelo_tenantId_codigo_key" ON "clausulas_modelo"("tenantId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cronogramas_fisico_financeiros_contratoId_parcela_key" ON "cronogramas_fisico_financeiros"("contratoId", "parcela");

-- CreateIndex
CREATE UNIQUE INDEX "restos_pagar_empenhoId_key" ON "restos_pagar"("empenhoId");

-- CreateIndex
CREATE INDEX "restos_pagar_tenantId_exercicio_idx" ON "restos_pagar"("tenantId", "exercicio");

-- CreateIndex
CREATE INDEX "convenios_tenantId_status_idx" ON "convenios"("tenantId", "status");

-- CreateIndex
CREATE INDEX "convenios_tenantId_vigenciaFim_idx" ON "convenios"("tenantId", "vigenciaFim");

-- CreateIndex
CREATE UNIQUE INDEX "convenios_tenantId_numero_ano_key" ON "convenios"("tenantId", "numero", "ano");

-- CreateIndex
CREATE UNIQUE INDEX "parcelas_convenio_convenioId_numero_key" ON "parcelas_convenio"("convenioId", "numero");

-- CreateIndex
CREATE INDEX "fiscalizacoes_contrato_tenantId_contratoId_idx" ON "fiscalizacoes_contrato"("tenantId", "contratoId");

-- CreateIndex
CREATE INDEX "fiscalizacoes_contrato_fiscalId_idx" ON "fiscalizacoes_contrato"("fiscalId");

-- CreateIndex
CREATE INDEX "ocorrencias_fiscalizacao_tenantId_contratoId_idx" ON "ocorrencias_fiscalizacao"("tenantId", "contratoId");

-- CreateIndex
CREATE INDEX "ocorrencias_fiscalizacao_tenantId_status_idx" ON "ocorrencias_fiscalizacao"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ocorrencias_fiscalizacao_tenantId_dataOcorrencia_idx" ON "ocorrencias_fiscalizacao"("tenantId", "dataOcorrencia");

-- CreateIndex
CREATE INDEX "medicoes_contrato_tenantId_contratoId_idx" ON "medicoes_contrato"("tenantId", "contratoId");

-- CreateIndex
CREATE UNIQUE INDEX "medicoes_contrato_contratoId_numero_key" ON "medicoes_contrato"("contratoId", "numero");

-- AddForeignKey
ALTER TABLE "pcas" ADD CONSTRAINT "pcas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pca" ADD CONSTRAINT "itens_pca_pcaId_fkey" FOREIGN KEY ("pcaId") REFERENCES "pcas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pca" ADD CONSTRAINT "itens_pca_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_compra" ADD CONSTRAINT "solicitacoes_compra_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_compra" ADD CONSTRAINT "solicitacoes_compra_centroCustoId_fkey" FOREIGN KEY ("centroCustoId") REFERENCES "centros_custo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_compra" ADD CONSTRAINT "solicitacoes_compra_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "setores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_compra" ADD CONSTRAINT "solicitacoes_compra_processoLicitatorioId_fkey" FOREIGN KEY ("processoLicitatorioId") REFERENCES "processos_licitatorios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_solicitacao_compra" ADD CONSTRAINT "itens_solicitacao_compra_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "solicitacoes_compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_solicitacao_compra" ADD CONSTRAINT "itens_solicitacao_compra_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesquisas_preco" ADD CONSTRAINT "pesquisas_preco_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesquisas_preco" ADD CONSTRAINT "pesquisas_preco_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "processos_licitatorios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pesquisa_preco" ADD CONSTRAINT "itens_pesquisa_preco_pesquisaId_fkey" FOREIGN KEY ("pesquisaId") REFERENCES "pesquisas_preco"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pesquisa_preco" ADD CONSTRAINT "itens_pesquisa_preco_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotacoes" ADD CONSTRAINT "cotacoes_pesquisaId_fkey" FOREIGN KEY ("pesquisaId") REFERENCES "pesquisas_preco"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotacoes" ADD CONSTRAINT "cotacoes_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_cotacao" ADD CONSTRAINT "itens_cotacao_cotacaoId_fkey" FOREIGN KEY ("cotacaoId") REFERENCES "cotacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_cotacao" ADD CONSTRAINT "itens_cotacao_itemPesquisaId_fkey" FOREIGN KEY ("itemPesquisaId") REFERENCES "itens_pesquisa_preco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editais" ADD CONSTRAINT "editais_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editais" ADD CONSTRAINT "editais_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "processos_licitatorios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editais" ADD CONSTRAINT "editais_substituidoPorId_fkey" FOREIGN KEY ("substituidoPorId") REFERENCES "editais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atas" ADD CONSTRAINT "atas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atas" ADD CONSTRAINT "atas_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "processos_licitatorios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_ata_registro_preco" ADD CONSTRAINT "itens_ata_registro_preco_ataId_fkey" FOREIGN KEY ("ataId") REFERENCES "atas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_ata_registro_preco" ADD CONSTRAINT "itens_ata_registro_preco_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_ata_registro_preco" ADD CONSTRAINT "itens_ata_registro_preco_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impugnacoes" ADD CONSTRAINT "impugnacoes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impugnacoes" ADD CONSTRAINT "impugnacoes_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "processos_licitatorios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recursos" ADD CONSTRAINT "recursos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recursos" ADD CONSTRAINT "recursos_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "processos_licitatorios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recursos" ADD CONSTRAINT "recursos_recorrenteFornecedorId_fkey" FOREIGN KEY ("recorrenteFornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_pregao" ADD CONSTRAINT "sessoes_pregao_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_pregao" ADD CONSTRAINT "sessoes_pregao_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "processos_licitatorios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lances" ADD CONSTRAINT "lances_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "sessoes_pregao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lances" ADD CONSTRAINT "lances_itemLicitacaoId_fkey" FOREIGN KEY ("itemLicitacaoId") REFERENCES "itens_licitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lances" ADD CONSTRAINT "lances_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habilitacoes_fornecedor" ADD CONSTRAINT "habilitacoes_fornecedor_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "sessoes_pregao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habilitacoes_fornecedor" ADD CONSTRAINT "habilitacoes_fornecedor_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garantias" ADD CONSTRAINT "garantias_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garantias" ADD CONSTRAINT "garantias_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clausulas_modelo" ADD CONSTRAINT "clausulas_modelo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cronogramas_fisico_financeiros" ADD CONSTRAINT "cronogramas_fisico_financeiros_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cronogramas_fisico_financeiros" ADD CONSTRAINT "cronogramas_fisico_financeiros_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restos_pagar" ADD CONSTRAINT "restos_pagar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restos_pagar" ADD CONSTRAINT "restos_pagar_empenhoId_fkey" FOREIGN KEY ("empenhoId") REFERENCES "empenhos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "processos_licitatorios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcelas_convenio" ADD CONSTRAINT "parcelas_convenio_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "convenios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscalizacoes_contrato" ADD CONSTRAINT "fiscalizacoes_contrato_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscalizacoes_contrato" ADD CONSTRAINT "fiscalizacoes_contrato_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias_fiscalizacao" ADD CONSTRAINT "ocorrencias_fiscalizacao_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias_fiscalizacao" ADD CONSTRAINT "ocorrencias_fiscalizacao_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicoes_contrato" ADD CONSTRAINT "medicoes_contrato_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicoes_contrato" ADD CONSTRAINT "medicoes_contrato_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
